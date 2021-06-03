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
 * US Standard Atmosphere 1976, NASA/NOAA, TM-X-74335
 */
class Atmosphere 
{
    constructor()
    {
        // [kg/kmol] molecular weight (US Standard Atmosphere 1976, Table 3, p.3)
        this.m_i = [
          28.0134,        // N2  - Nitrogen
          31.9988,        // O2  - Oxygen
          39.948,         // Ar  - Argon
          44.00995,       // CO2 - Carbon Dioxide
          20.183,         // Ne  - Neon
          4.0026,         // He  - Helium
          83.8,           // Kr  - Krypton
          131.3,          // Xe  - Xenon
          16.04303,       // CH4 - Methane
          2.01594         // H2  - Hydrogen
        ];
        
        // [-] fractional volume (US Standard Atmosphere 1976, Table 3, p.3)
        this.f_i = [
          0.78084,        // N2  - Nitrogen
          0.209476,       // O2  - Oxygen
          0.00934,        // Ar  - Argon
          0.000314,       // CO2 - Carbon Dioxide
          0.00001818,     // Ne  - Neon
          0.00000524,     // He  - Helium
          0.00000114,     // Kr  - Krypton
          0.000000087,    // Xe  - Xenon
          0.000002,       // CH4 - Methane
          0.0000005       // H2  - Hydrogen
        ];
    
        // [kg/kmol] mean molecular weight (28.964507914535)
        this.m =  
              ( this.m_i[ 0 ] * this.f_i[ 0 ]
              + this.m_i[ 1 ] * this.f_i[ 1 ]
              + this.m_i[ 2 ] * this.f_i[ 2 ]
              + this.m_i[ 3 ] * this.f_i[ 3 ]
              + this.m_i[ 4 ] * this.f_i[ 4 ]
              + this.m_i[ 5 ] * this.f_i[ 5 ]
              + this.m_i[ 6 ] * this.f_i[ 6 ]
              + this.m_i[ 7 ] * this.f_i[ 7 ]
              + this.m_i[ 8 ] * this.f_i[ 8 ]
              + this.m_i[ 9 ] * this.f_i[ 9 ] )
              /
              ( this.f_i[ 0 ]
              + this.f_i[ 1 ]
              + this.f_i[ 2 ]
              + this.f_i[ 3 ]
              + this.f_i[ 4 ]
              + this.f_i[ 5 ]
              + this.f_i[ 6 ]
              + this.f_i[ 7 ]
              + this.f_i[ 8 ]
              + this.f_i[ 9 ] );  
        
        this.r     = 8.31432e3;   // [J/(kmol*K)] universal gas constant (US Standard Atmosphere 1976, Table 2, p.2)
        this.s     = 110.0;       // [K] Sutherland constant             (US Standard Atmosphere 1976, Table 2, p.2)
        this.beta  = 1.458e-6;    // [kg/(s*m*K^0.5)] a constant used in computing dynamic viscosity (US Standard Atmosphere 1976, Table 2, p.2)
        this.gamma = 1.4;         // [-] a constant taken to represent the ratio of specific heat at constant pressure to the specific heat at constant volume (cp/cv) (US Standard Atmosphere 1976, Table 2, p.2)
        this.wgs_g = 9.80665;     // [m/s^2] standard gravitional acceleration
        
        this.t_0   = 288.15;      // [K]      standard sea level temperature (288.15 K or 15 deg C)
        this.p_0   = 101325.0;    // [Pa]     standard sea level pressure    (1013.25 hPa)
        this.rho_0 = 1.225;       // [kg/m^3] standard sea level density     (1.225 kg/m^3)
        
        this.temp  = 0.0;         // [K]      temperature
        this.press = 0.0;         // [Pa]     static pressure
        this.dens  = 0.0;         // [kg/m^3] density
        this.sound = 0.0;         // [m/s]    speed of sound
        this.visc  = 0.0;         // [Pa*s]   dynamic viscosity
        this.kinViscosity = 0.0;  // [m^2/s]  kinematic viscosity
        
        this.valid = false;
        
        // [m] altitude values (US Standard Atmosphere 1976, Table 4, p.3)
        this.h_b = [
          11000.0,
          20000.0,
          32000.0,
          47000.0,
          51000.0,
          71000.0,
          84852.0
        ];
        
        // [Pa] pressure values (US Standard Atmosphere 1976, Table I, p.50-73)
        this.p_b = [
          101325.0,         // 11000
          22632.0,          // 20000
            5474.8,         // 32000
            868.01,         // 47000
            110.9,          // 51000
              66.938,       // 71000
              3.9564        // 84852
        ];
        
        // [K] temperature values (US Standard Atmosphere 1976, Table I, p.50-73)
        this.t_b = [
            288.15,         // 11000
            216.65,         // 20000
            216.65,         // 32000
            228.65,         // 47000
            270.65,         // 51000
            270.65,         // 71000
            214.65          // 84852
        ];
        
        // [K/m] temperature gradients (US Standard Atmosphere 1976, Table 4, p.3)
        this.l_b = [
            -6.5e-3,        // 11000
            0.0,            // 20000
            1.0e-3,         // 32000
            2.8e-3,         // 47000
            0.0,            // 51000
            -2.8e-3,        // 71000
            -2.0e-3         // 84852
        ];
    }
    
    update( alt )
    {
        this.temp  = 0.0;
        this.press = 0.0;
        this.dens  = 0.0;
        this.sound = 0.0;
        this.visc  = 0.0;
        this.kinViscosity = 0.0;
        
        this.valid = false;
        
        if ( alt > this.h_b[ 6 ] )
        {
            return;
        }
        
        var hb = this.h_b[ 5 ];
        var pb = this.p_b[ 6 ];
        var tb = this.t_b[ 6 ];
        var lb = 0.0;
        
        if ( alt < this.h_b[ 0 ] )
        {
            hb = 0.0;
            pb = this.p_b[ 0 ];
            tb = this.t_0;
            lb = -( this.t_0 - this.t_b[ 1 ] ) / this.h_b[ 0 ];
            
            this.valid = true;
        }
        else
        {
            for ( var i = 1; i < 7; i++ )
            {
                if ( alt < this.h_b[ i ] )
                {
                    hb = this.h_b[ i - 1 ];
                    pb = this.p_b[ i ];
                    tb = this.t_b[ i ];
                    lb = this.l_b[ i ];
                    
                    this.valid = true;

                    break;
                }
            }
        }
        
        if ( this.valid )
        {
            var delta_h = alt - hb;

            // [K] temperature, US Standard Atmosphere 1976, p.10
            this.temp = tb + lb * delta_h;
            
            // [Pa] pressure, US Standard Atmosphere 1976, p.12
            if ( Math.abs( lb ) < 1.0e-6 )
            {
                this.press = pb * Math.exp( -( this.wgs_g * this.m * delta_h ) / ( this.r * tb ) );
            }
            else
            {
                this.press = pb * Math.pow( tb / this.temp, ( this.wgs_g * this.m ) / ( this.r * lb ) );
            }

            // [kg/m^3] density, US Standard Atmosphere 1976, p.15
            this.dens = ( this.press * this.m ) / ( this.r * this.temp );

            // [m/s] speed of sound, US Standard Atmosphere 1976, p.18
            this.sound = Math.sqrt( ( this.gamma * this.r * this.temp ) / this.m );

            // [Pa*s] dynamic viscosity, US Standard Atmosphere 1976, p.19
            this.visc = this.beta * Math.pow( this.temp, 3.0 / 2.0 ) / ( this.temp + this.s );

            // [m^2/s] kinematic viscosity, US Standard Atmosphere 1976, p.19
            this.kinViscosity = this.visc / this.dens;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

/** */
function k2c( temp )
{
    return ( temp - 273.15 );
}

/** */
function k2f( temp )
{
    return ( 9.0 * ( temp - 273.15 ) / 5.0 ) + 32.0;
}

/** */
function k2r( temp )
{
    return ( 9.0 * ( temp - 273.15 ) / 5.0 ) + 32.0 + 459.67;
}

////////////////////////////////////////////////////////////////////////////////

function calcAtmos()
{
    var alt_raw = parseFloat( document.getElementById( "inp_alt" ).value );
    
    var unit_alt   = document.getElementById( "unit_alt"   ).value;
    var unit_temp  = document.getElementById( "unit_temp"  ).value;
    var unit_press = document.getElementById( "unit_press" ).value;
    var unit_dens  = document.getElementById( "unit_dens"  ).value;
    var unit_sound = document.getElementById( "unit_sound" ).value;
    var unit_visc  = document.getElementById( "unit_visc"  ).value;
    
    var coef_alt   = 1.0;
    var coef_press = 1.0;
    var coef_dens  = 1.0;
    var coef_sound = 1.0;
    var coef_visc  = 1.0;
    
    var prec_temp  = 2;
    var prec_press = 1;
    var prec_dens  = 4;
    var prec_sound = 2;
    var prec_visc  = 6;
    
    switch ( unit_alt )
    {
        case '1': coef_alt = 1.0;    break;
        case '2': coef_alt = 0.3048; break;
    }
    
    var alt_m = coef_alt * alt_raw;
    
    var atmos = new Atmosphere();
    atmos.update( parseFloat(alt_m) );
    
    var temp  = 1.0 / 0.0;
    
    switch ( unit_temp )
    {
        case '1': temp = atmos.temp;        break;
        case '2': temp = k2c( atmos.temp ); break;
        case '3': temp = k2r( atmos.temp ); break;    
        case '4': temp = k2f( atmos.temp ); break;
    }
    
    switch ( unit_press )
    {
        case '1': coef_press = 1.0;            prec_press = 1; break;
        case '2': coef_press = 0.01;           prec_press = 3; break;
        case '3': coef_press = 0.000295333727; prec_press = 5; break;
        case '4': coef_press = 0.000145037738; prec_press = 5; break;
    }
    
    switch ( unit_dens )
    {
        case '1': coef_dens = 1.0;  break;
    }
    
    switch ( unit_sound )
    {
        case '1': coef_sound = 1.0;         prec_sound = 2; break;
        case '2': coef_sound = 3.2808399;   prec_sound = 1; break;
        case '3': coef_sound = 3.6;         prec_sound = 1; break;
        case '4': coef_sound = 1.943844491; prec_sound = 2; break;
    }
    
    switch ( unit_visc )
    {
        case '1': coef_visc = 1.0;  break;
    }
    
    if ( atmos.valid )
    {
        document.getElementById( "calc_error" ).style.display = "none";
        
        var press = coef_press * atmos.press;
        var dens  = coef_dens  * atmos.dens;
        var sound = coef_sound * atmos.sound;
        var visc  = coef_visc  * atmos.visc;
        
        document.getElementById( "out_temp"  ).innerHTML = temp  .toFixed( prec_temp  );
        document.getElementById( "out_press" ).innerHTML = press .toFixed( prec_press );
        document.getElementById( "out_dens"  ).innerHTML = dens  .toFixed( prec_dens  );
        document.getElementById( "out_sound" ).innerHTML = sound .toFixed( prec_sound );
        document.getElementById( "out_visc"  ).innerHTML = visc  .toExponential( prec_visc );
    }
    else 
    {
        document.getElementById( "calc_error" ).style.display = "block";
        
        
        document.getElementById( "out_temp"  ).innerHTML = "";
        document.getElementById( "out_press" ).innerHTML = "";
        document.getElementById( "out_dens"  ).innerHTML = "";
        document.getElementById( "out_sound" ).innerHTML = "";
        document.getElementById( "out_visc"  ).innerHTML = "";
    }
}

////////////////////////////////////////////////////////////////////////////////

function altUnitChanged()
{
    var alt = document.getElementById( "inp_alt" ).value;
    
    var unit_alt = document.getElementById( "unit_alt" ).value;
    
    var coef_alt = 1.0;
    
    switch ( unit_alt )
    {
        case '1': coef_alt = 0.3048;       break;
        case '2': coef_alt = 1.0 / 0.3048; break;
    }
    
    alt = alt * coef_alt;
    
    document.getElementById( "inp_alt" ).value = alt.toFixed( 2 );
  
    calcAtmos();
}
