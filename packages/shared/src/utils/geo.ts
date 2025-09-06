import { Coordinates } from '../types/common';

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_M = 6371000;

type DistanceUnit = 'km' | 'm' | 'mi' | 'ft';

export class GeoUtils {
  /**
   * Converts degrees to radians
   */
  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculates the distance between two coordinates using the Haversine formula
   * @param coord1 First coordinate
   * @param coord2 Second coordinate
   * @param unit Unit of distance ('km' or 'm')
   * @returns Distance between the two points in the specified unit
   */
  static calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates,
    unit: DistanceUnit = 'km'
  ): number {
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    let distance = EARTH_RADIUS_KM * c;
    
    // Convert to requested unit
    switch (unit) {
      case 'm':
        return distance * 1000;
      case 'mi':
        return distance * 0.621371;
      case 'ft':
        return distance * 3280.84;
      case 'km':
      default:
        return distance;
    }
  }

  /**
   * Checks if a point is within a certain radius of another point
   * @param point The point to check
   * @param center The center point
   * @param radius Radius in kilometers
   * @returns True if the point is within the radius
   */
  static isWithinRadius(
    point: Coordinates,
    center: Coordinates,
    radius: number,
    unit: DistanceUnit = 'km'
  ): boolean {
    const distance = this.calculateDistance(point, center, unit);
    return distance <= radius;
  }

  /**
   * Calculates the bounding box coordinates for a point and radius
   * @param center Center coordinate
   * @param radius Radius in kilometers
   * @returns Bounding box coordinates
   */
  static getBoundingBox(
    center: Coordinates,
    radius: number,
    unit: DistanceUnit = 'km'
  ): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
    // Convert radius to kilometers if needed
    const radiusKm = unit === 'km' ? radius : unit === 'm' ? radius / 1000 : radius * 1.60934;
    
    // Earth's radius in kilometers
    const R = 6371;
    
    // Convert latitude and longitude to radians
    const lat = this.toRad(center.lat);
    const lng = this.toRad(center.lng);
    
    // Calculate the angular distance in radians
    const d = radiusKm / R;
    
    // Calculate the bounding box coordinates
    const minLat = lat - d;
    const maxLat = lat + d;
    const minLng = lng - d / Math.cos(lat);
    const maxLng = lng + d / Math.cos(lat);
    
    // Convert back to degrees
    return {
      minLat: (minLat * 180) / Math.PI,
      maxLat: (maxLat * 180) / Math.PI,
      minLng: (minLng * 180) / Math.PI,
      maxLng: (maxLng * 180) / Math.PI,
    };
  }

  /**
   * Calculates the initial bearing from one point to another
   * @param start Starting coordinate
   * @param end Ending coordinate
   * @returns Bearing in degrees from north (0-360)
   */
  static calculateBearing(start: Coordinates, end: Coordinates): number {
    const startLat = this.toRad(start.lat);
    const startLng = this.toRad(start.lng);
    const endLat = this.toRad(end.lat);
    const endLng = this.toRad(end.lng);

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Calculates a new point given a starting point, distance, and bearing
   * @param start Starting coordinate
   * @param distance Distance in kilometers
   * @param bearing Bearing in degrees from north
   * @returns New coordinate
   */
  static calculateDestination(
    start: Coordinates,
    distance: number,
    bearing: number,
    unit: DistanceUnit = 'km'
  ): Coordinates {
    // Convert distance to kilometers if needed
    const distanceKm = unit === 'km' ? distance : unit === 'm' ? distance / 1000 : distance * 1.60934;
    
    // Convert to radians
    const lat1 = this.toRad(start.lat);
    const lng1 = this.toRad(start.lng);
    const bearingRad = this.toRad(bearing);
    
    const angularDistance = distanceKm / EARTH_RADIUS_KM;
    
    // Calculate new latitude
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );
    
    // Calculate new longitude
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      );
    
    // Convert back to degrees
    return {
      lat: (lat2 * 180) / Math.PI,
      lng: (((lng2 * 180) / Math.PI + 540) % 360) - 180, // Normalize to -180 to 180
    };
  }

  /**
   * Calculates the midpoint between two coordinates
   * @param coord1 First coordinate
   * @param coord2 Second coordinate
   * @returns Midpoint coordinate
   */
  static calculateMidpoint(coord1: Coordinates, coord2: Coordinates): Coordinates {
    // Convert to radians
    const lat1 = this.toRad(coord1.lat);
    const lng1 = this.toRad(coord1.lng);
    const lat2 = this.toRad(coord2.lat);
    const lng2 = this.toRad(coord2.lng);
    
    // Calculate midpoints
    const Bx = Math.cos(lat2) * Math.cos(lng2 - lng1);
    const By = Math.cos(lat2) * Math.sin(lng2 - lng1);
    
    const lat3 = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    
    const lng3 = lng1 + Math.atan2(By, Math.cos(lat1) + Bx);
    
    // Convert back to degrees
    return {
      lat: (lat3 * 180) / Math.PI,
      lng: (((lng3 * 180) / Math.PI + 540) % 360) - 180, // Normalize to -180 to 180
    };
  }

  /**
   * Formats a distance with appropriate unit
   * @param distance Distance in meters
   * @returns Formatted distance string (e.g., "1.2 km" or "500 m")
   */
  static formatDistance(distance: number, unit: DistanceUnit = 'm'): string {
    let value = distance;
    let formattedUnit = unit;
    
    // Convert to appropriate unit
    if (unit === 'm' && distance >= 1000) {
      value = distance / 1000;
      formattedUnit = 'km';
    } else if (unit === 'ft' && distance >= 5280) {
      value = distance / 5280;
      formattedUnit = 'mi';
    }
    
    // Format the number
    const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
    
    return `${formattedValue} ${formattedUnit}`;
  }

  /**
   * Converts between different distance units
   * @param value The value to convert
   * @param fromUnit The unit to convert from
   * @param toUnit The unit to convert to
   * @returns The converted value
   */
  static convertDistance(
    value: number,
    fromUnit: DistanceUnit,
    toUnit: DistanceUnit
  ): number {
    if (fromUnit === toUnit) return value;
    
    // First convert to meters
    let meters: number;
    switch (fromUnit) {
      case 'km':
        meters = value * 1000;
        break;
      case 'mi':
        meters = value * 1609.34;
        break;
      case 'ft':
        meters = value * 0.3048;
        break;
      case 'm':
      default:
        meters = value;
    }
    
    // Then convert to the target unit
    switch (toUnit) {
      case 'km':
        return meters / 1000;
      case 'mi':
        return meters / 1609.34;
      case 'ft':
        return meters / 0.3048;
      case 'm':
      default:
        return meters;
    }
  }
}
