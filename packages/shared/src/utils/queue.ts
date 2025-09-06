import { QueueEntryStatus } from '../types/queue';
import { TimeUtils } from './time';

export class QueueUtils {
  /**
   * Calculates the estimated wait time for a position in the queue
   * @param position Current position in the queue
   * @param averageServiceTime Average service time per customer in seconds
   * @param varianceServiceTime Variance in service time (0-1, where 0 means no variance)
   * @returns Estimated wait time in seconds
   */
  static calculateWaitTime(
    position: number,
    averageServiceTime: number,
    varianceServiceTime: number = 0.2
  ): number {
    // Basic calculation: position * average service time
    let waitTime = position * averageServiceTime;
    
    // Add some variance based on service time
    if (varianceServiceTime > 0) {
      const varianceFactor = 1 + (Math.random() * 2 - 1) * varianceServiceTime;
      waitTime *= varianceFactor;
    }
    
    return Math.max(0, Math.round(waitTime));
  }

  /**
   * Calculates the recommended leave time based on current position and travel time
   * @param position Current position in the queue
   * @param averageServiceTime Average service time per customer in seconds
   * @param travelTime Time to reach the venue in seconds
   * @param options Additional options for calculation
   * @returns Object with recommended leave time and other details
   */
  static calculateRecommendedLeaveTime(
    position: number,
    averageServiceTime: number,
    travelTime: number,
    options: {
      varianceServiceTime?: number;
      bufferTime?: number;
      minBufferTime?: number;
      maxBufferTime?: number;
      currentTime?: Date;
    } = {}
  ) {
    const {
      varianceServiceTime = 0.2,
      bufferTime = 0.2, // 20% buffer by default
      minBufferTime = 5 * 60, // 5 minutes in seconds
      maxBufferTime = 30 * 60, // 30 minutes in seconds
      currentTime = new Date()
    } = options;

    // Calculate estimated wait time
    const estimatedWaitTime = this.calculateWaitTime(
      position,
      averageServiceTime,
      varianceServiceTime
    );

    // Calculate buffer time (dynamic based on position and service time)
    const calculatedBuffer = Math.min(
      Math.max(
        Math.round(estimatedWaitTime * bufferTime),
        minBufferTime
      ),
      maxBufferTime
    );

    // Calculate recommended leave time
    const recommendedLeaveIn = Math.max(0, estimatedWaitTime - travelTime - calculatedBuffer);
    const leaveAt = new Date(currentTime.getTime() + recommendedLeaveIn * 1000);
    
    // Calculate confidence level
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (position > 10) confidence = 'medium';
    if (position > 20) confidence = 'low';

    return {
      position,
      estimatedWaitTime,
      travelTime,
      bufferTime: calculatedBuffer,
      recommendedLeaveIn,
      leaveAt,
      confidence,
    };
  }

  /**
   * Determines if a queue entry status is considered active
   */
  static isActiveStatus(status: QueueEntryStatus): boolean {
    return ['WAITING', 'CALLED'].includes(status);
  }

  /**
   * Determines if a queue entry status is considered completed
   */
  static isCompletedStatus(status: QueueEntryStatus): boolean {
    return ['SERVED', 'NOSHOW', 'CANCELLED'].includes(status);
  }

  /**
   * Formats a queue position with the appropriate suffix
   */
  static formatPosition(position: number): string {
    if (position <= 0) return 'Next';
    
    const lastDigit = position % 10;
    const lastTwoDigits = position % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${position}th`;
    }
    
    switch (lastDigit) {
      case 1:
        return `${position}st`;
      case 2:
        return `${position}nd`;
      case 3:
        return `${position}rd`;
      default:
        return `${position}th`;
    }
  }

  /**
   * Calculates the estimated time until a specific position is called
   * @param currentPosition Current position in the queue
   * @param targetPosition Target position to estimate
   * @param averageServiceTime Average service time per customer in seconds
   * @returns Estimated time in seconds until the target position is called
   */
  static estimateTimeUntilPosition(
    currentPosition: number,
    targetPosition: number,
    averageServiceTime: number
  ): number {
    if (currentPosition <= 0 || targetPosition <= 0 || targetPosition > currentPosition) {
      return 0;
    }
    
    const positionsAhead = currentPosition - targetPosition;
    return Math.round(positionsAhead * averageServiceTime);
  }

  /**
   * Calculates the optimal time to send a notification before the user's turn
   * @param currentPosition Current position in the queue
   * @param averageServiceTime Average service time per customer in seconds
   * @param travelTime Time to reach the venue in seconds
   * @param notificationOffset Additional time to add before the notification (in seconds)
   * @returns Time in seconds before the user's turn to send the notification
   */
  static calculateNotificationTime(
    currentPosition: number,
    averageServiceTime: number,
    travelTime: number,
    notificationOffset: number = 5 * 60 // 5 minutes in seconds
  ): number {
    const estimatedTime = currentPosition * averageServiceTime;
    return Math.max(0, estimatedTime - travelTime - notificationOffset);
  }

  /**
   * Calculates the estimated number of people that can be served in a given time period
   * @param timePeriod Time period in seconds
   * @param averageServiceTime Average service time per customer in seconds
   * @param numServers Number of servers (default: 1)
   * @returns Estimated number of people that can be served
   */
  static estimateServedInTime(
    timePeriod: number,
    averageServiceTime: number,
    numServers: number = 1
  ): number {
    if (averageServiceTime <= 0) return 0;
    return Math.floor((timePeriod * numServers) / averageServiceTime);
  }

  /**
   * Calculates the optimal number of servers needed based on queue length and target wait time
   * @param queueLength Current number of people in the queue
   * @param averageServiceTime Average service time per customer in seconds
   * @param targetWaitTime Target maximum wait time in seconds
   * @returns Recommended number of servers needed
   */
  static calculateOptimalServers(
    queueLength: number,
    averageServiceTime: number,
    targetWaitTime: number
  ): number {
    if (averageServiceTime <= 0 || targetWaitTime <= 0) return 1;
    
    // Basic calculation: (queue length * service time) / target wait time
    const servers = Math.ceil((queueLength * averageServiceTime) / targetWaitTime);
    return Math.max(1, servers); // Always return at least 1 server
  }

  /**
   * Calculates the probability of a no-show based on historical data
   * @param totalNoShows Total number of no-shows
   * @param totalEntries Total number of queue entries
   * @returns Probability of no-show (0-1)
   */
  static calculateNoShowProbability(
    totalNoShows: number,
    totalEntries: number
  ): number {
    if (totalEntries <= 0) return 0;
    return Math.min(1, Math.max(0, totalNoShows / totalEntries));
  }

  /**
   * Adjusts the estimated wait time based on the no-show probability
   * @param estimatedWaitTime Original estimated wait time in seconds
   * @param noShowProbability Probability of no-show (0-1)
   * @param position Current position in the queue
   * @returns Adjusted estimated wait time in seconds
   */
  static adjustForNoShowProbability(
    estimatedWaitTime: number,
    noShowProbability: number,
    position: number
  ): number {
    if (noShowProbability <= 0 || position <= 0) return estimatedWaitTime;
    
    // The more people ahead, the higher the impact of no-shows
    const adjustmentFactor = 1 - (noShowProbability * (1 - Math.exp(-position / 10)));
    return Math.round(estimatedWaitTime * adjustmentFactor);
  }

  /**
   * Calculates the estimated service completion time for all current queue entries
   * @param queueData Array of queue entries with service times
   * @param numServers Number of servers (default: 1)
   * @returns Estimated completion times for each queue entry
   */
  static calculateCompletionTimes<T extends { serviceTime: number }>(
    queueData: T[],
    numServers: number = 1
  ): { item: T; startTime: number; endTime: number }[] {
    if (queueData.length === 0) return [];
    
    // Sort queue by position or any other criteria if needed
    const sortedQueue = [...queueData].sort((a, b) => {
      // If items have a position property, sort by it
      if ('position' in a && 'position' in b) {
        return (a as any).position - (b as any).position;
      }
      return 0;
    });
    
    // Initialize server end times
    const serverEndTimes = Array(numServers).fill(0);
    
    return sortedQueue.map(item => {
      // Find the server that will be available soonest
      const serverIndex = serverEndTimes.indexOf(Math.min(...serverEndTimes));
      const startTime = serverEndTimes[serverIndex];
      const endTime = startTime + item.serviceTime;
      
      // Update the server's end time
      serverEndTimes[serverIndex] = endTime;
      
      return {
        item,
        startTime,
        endTime
      };
    });
  }
}
