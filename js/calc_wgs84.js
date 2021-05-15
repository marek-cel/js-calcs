/****************************************************************************//*
 * Copyright (C) 2021 Marek M. Cel
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 ******************************************************************************/

 /**
  * Department of Defence World Geodetic System 1984, NIMA, TR-8350.2, 2000
  * Burtch R.: A Comparison of Methods Used in Rectangular to Geodetic Coordinate Transformations, 2006
  * Bowring B.: Transformation from spatial to geocentric coordinates, 1976
  * Zhu J.: Conversion of Earth-centered Earth-fixed coordinates to geodetic coordinates, 1994
  */
class WGS84
{
    constructor()
    {
        this.a   = 6378137.0;           // [m] equatorial radius
        this.f   = 1.0 / 298.257223563; // [-] ellipsoid flattening

        this.b   = 6356752.3142;        // [m] polar radius
        this.a2  = this.a * this.a;     // [m^2] equatorial radius squared
        this.b2  = this.b * this.b;     // [m^2] polar radius squared
        this.e2  = 6.6943799901400e-3;  // [-] ellipsoid first eccentricity squared
        this.ep2 = 6.7394967422800e-3;  // [-] ellipsoid second eccentricity squared
    }
    
    /** */
    geo2wgs( lat, lon, alt )
    {
        var sinLat = Math.sin( lat );
        var cosLat = Math.cos( lat );
        var sinLon = Math.sin( lon );
        var cosLon = Math.cos( lon );

        var n = this.a / Math.sqrt( 1.0 - this.e2 * sinLat*sinLat );

        var x = ( n + alt ) * cosLat * cosLon;
        var y = ( n + alt ) * cosLat * sinLon;
        var z = ( n * ( this.b2 / this.a2 ) + alt ) * sinLat;
        
        return [ x, y, z ];
    }
    
    /** */
    wgs2geo( x, y, z )
    {
        var z2 = z*z;
        var r  = Math.sqrt( x*x + y*y );
        var r2 = r*r;
        var e2 = this.a2 - this.b2;
        var f  = 54.0 * this.b2 * z2;
        var g  = r2 + ( 1.0 - this.e2 )*z2 - this.e2*e2;
        var c  = this.e2*this.e2 * f * r2 / ( g*g*g );
        var s  = Math.pow( 1.0 + c + Math.sqrt( c*c + 2.0*c ), 1.0/3.0 );
        var p0 = s + 1.0/s + 1.0;
        var p  = f / ( 3.0 * p0*p0 * g*g );
        var q  = Math.sqrt( 1.0 + 2.0*( this.e2*this.e2 )*p );
        var r0 = -( p * this.e2 * r )/( 1.0 + q ) + Math.sqrt( 0.5*this.a2*( 1.0 + 1.0/q ) - p*( 1.0 - this.e2 )*z2/( q + q*q ) - 0.5*p*r2 );
        var uv = r - this.e2*r0;
        var u  = Math.sqrt( uv*uv + z2 );
        var v  = Math.sqrt( uv*uv + ( 1.0 - this.e2 )*z2 );
        var z0 = this.b2 * z / ( this.a * v );

        var alt = u * ( 1.0 - this.b2 / ( this.a * v ) );
        var lat = Math.atan( ( z + this.ep2*z0 )/r );
        var lon = Math.atan2( y, x );
        
        return [ lat, lon, alt ];
    }
}

////////////////////////////////////////////////////////////////////////////////

/** */
function deg2rad( ang )
{
    return ang * Math.PI / 180.0;
}

/** */
function rad2deg( ang )
{
    return ang * 180.0 / Math.PI;
}

////////////////////////////////////////////////////////////////////////////////

function calcGeo2XYZ()
{
    var inp_lon = document.getElementById( "inp_lon" ).value;
    var inp_lat = document.getElementById( "inp_lat" ).value;
    var inp_alt = document.getElementById( "inp_alt" ).value;
    
    if ( inp_lon < -180.0 || inp_lon > 180 || inp_lat < -90 || inp_lat > 90 )
    {
        document.getElementById( "out_x" ).innerHTML = "";
        document.getElementById( "out_y" ).innerHTML = "";
        document.getElementById( "out_z" ).innerHTML = "";
    }
    else
    {
        var inp_lon_rad = deg2rad( inp_lon );
        var inp_lat_rad = deg2rad( inp_lat );
        
        var wgs = new WGS84();
        var result = wgs.geo2wgs( parseFloat(inp_lat_rad),
                                  parseFloat(inp_lon_rad),
                                  parseFloat(inp_alt) );
        
        var out_x = result[ 0 ];
        var out_y = result[ 1 ];
        var out_z = result[ 2 ];
        
        document.getElementById( "out_x" ).innerHTML = out_x;
        document.getElementById( "out_y" ).innerHTML = out_y;
        document.getElementById( "out_z" ).innerHTML = out_z;
    }
}

////////////////////////////////////////////////////////////////////////////////

function calcXYZ2Geo()
{
    var inp_x = document.getElementById( "inp_x" ).value;
    var inp_y = document.getElementById( "inp_y" ).value;
    var inp_z = document.getElementById( "inp_z" ).value;
    
    var wgs = new WGS84();
    var result = wgs.wgs2geo( parseFloat(inp_x),
                              parseFloat(inp_y),
                              parseFloat(inp_z) );
    
    var out_lat = rad2deg( result[ 0 ] );
    var out_lon = rad2deg( result[ 1 ] );
    var out_alt = result[ 2 ];
    
    document.getElementById( "out_lat" ).innerHTML = out_lat;
    document.getElementById( "out_lon" ).innerHTML = out_lon;
    document.getElementById( "out_alt" ).innerHTML = out_alt;
}
