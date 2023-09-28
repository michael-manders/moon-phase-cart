/* eslint-disable */

import React from "react";

import "./assets/css/normalize.css";
import "./assets/css/App.css";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: "",
            updateFunction: undefined,
            updated: false,
            dataFunction: undefined,
            long: -96,
            lat: 32,
            tz: -5,
            months: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ],
        };

        this.updateRows = this.updateRows.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.getTimeZone = this.getTimeZone.bind(this);
        this.onNewMonthSelect = this.onNewMonthSelect.bind(this);
        this.setUpdateFunction = this.setUpdateFunction.bind(this);
        this.setUpdated = this.setUpdated.bind(this);
        this.setDataFunction = this.setDataFunction.bind(this);
        this.format_time = this.format_time.bind(this);
    }

    updateRows(rows) {
        this.setState({ rows: `.5fr repeat(${rows}, 1fr)` });
    }

    setUpdated() {
        this.setState({ updated: true });
    }

    format_time(time) {
        time = time.padStart(4, "0");
        let hours = time.substring(0, 2);
        let minutes = time.substring(2, 4);

        if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) {
            // console.log(time);
            return "----";
        }

        return `${hours}:${minutes}`;
    }

    selectDate(day, month, year) {
        let long = parseInt(this.state.long);
        let lat = parseInt(this.state.lat);
        let tz = parseInt(this.state.tz);

        let numberOfDaysInMonth = new Date(year, month, 0).getDate();

        let statsPerDay = [];

        for (let i = 1; i <= numberOfDaysInMonth; i++) {
            statsPerDay.push(
                this.state.dataFunction(year, month, i, long, lat, tz)
            );
        }

        let newMoonDate = undefined;
        let newMoonValue = 1;
        let fullMoonDate = undefined;
        let fullMoonValue = 0;

        for (let stat of statsPerDay) {
            // console.log(stat.moonillumination);

            if (stat.moonillumination < newMoonValue) {
                newMoonDate = statsPerDay.indexOf(stat);
                newMoonValue = stat.moonillumination;
            }
            if (stat.moonillumination > fullMoonValue) {
                fullMoonDate = statsPerDay.indexOf(stat);
                fullMoonValue = stat.moonillumination;
            }
        }

        fullMoonDate++;

        let newMoonDay = new Date(year, month, newMoonDate + 1);
        let fullMoonDay = new Date(year, month, fullMoonDate);

        // console.log(fullMoonDay);

        let newMoonDayString = `${newMoonDay.getDate()} ${
            this.state.months[newMoonDay.getMonth()]
        } ${newMoonDay.getFullYear()}`;

        let fullMoonDayString = `${fullMoonDay.getDate()} ${
            this.state.months[fullMoonDay.getMonth()]
        } ${fullMoonDay.getFullYear()}`;

        let dateStats = statsPerDay[day - 1];

        // console.log(dateStats);

        let sunrise_string = this.format_time(dateStats.sunrise);
        let sunset_string = this.format_time(dateStats.sunset);
        let moonrise_string = this.format_time(dateStats.moonrise);
        let moonset_string = this.format_time(dateStats.moonset);
        let astro_twilight_begin_string = this.format_time(
            dateStats.astro_twilight_begin
        );
        let astro_twilight_end_string = this.format_time(
            dateStats.astro_twilight_end
        );
        let astro_twilight_length_string =
            parseInt(dateStats.astro_twilight_length / 60)
                .toString()
                .padStart(2, "0") +
            ":" +
            parseInt(dateStats.astro_twilight_length % 60)
                .toString()
                .padStart(2, "0");

        console.log(dateStats);

        let illumination = parseInt(dateStats.moonillumination * 100);

        // add all to the dom

        document.querySelector("#sunrise .content").innerHTML = sunrise_string;
        document.querySelector("#sunset .content").innerHTML = sunset_string;
        document.querySelector("#moonrise .content").innerHTML =
            moonrise_string;
        document.querySelector("#moonset .content").innerHTML = moonset_string;
        document.querySelector("#astro-twilight-begin .content").innerHTML =
            astro_twilight_begin_string;
        document.querySelector("#astro-twilight-end .content").innerHTML =
            astro_twilight_end_string;
        document.querySelector("#astro-dark-length .content").innerHTML =
            astro_twilight_length_string;
        document.querySelector("#new-moon-date").innerHTML = newMoonDayString;
        document.querySelector("#full-moon-date").innerHTML = fullMoonDayString;
        document.querySelector(
            "#illumination .content"
        ).innerHTML = `${illumination}%`;

        document.querySelector(
            "#date-content"
        ).innerHTML = `${day} ${this.state.months[month]} ${year}`;

        document
            .querySelector("#day-details")
            .setAttribute("data-visible", "true");
    }

    async componentDidMount() {
        const updateRows = this.updateRows;
        const selectDate = this.selectDate;
        const getTimeZone = this.getTimeZone;
        const format_time = this.format_time;

        const LUNAR_MONTH = 29.530588853;
        const JULIAN_YEAR = 365.25;
        const J2000 =
            new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime() / 86400000 -
            10957.5;
        const KNOWN_NEW_MOON =
            new Date(Date.UTC(2000, 0, 6, 6, 14, 0)).getTime() / 86400000 -
            10957.5;

        function centuriesSinceJ2000(time) {
            return (
                (time.getTime() / 86400000 - 10957.5 - J2000) /
                (JULIAN_YEAR * 100)
            );
        }

        function rad(num) {
            let angle = num % 360;
            angle += 360 * (angle < 0 ? 1 : 0);
            return (angle * Math.PI) / 180;
        }

        function illumination(time = new Date()) {
            const t = centuriesSinceJ2000(time);

            const d = rad(
                297.8501921 +
                    445267.1114034 * t -
                    0.0018819 * t * t +
                    (1.0 / 545868.0) * t * t * t -
                    (1.0 / 113065000.0) * t * t * t * t
            );
            const m = rad(
                357.5291092 +
                    35999.0502909 * t -
                    0.0001536 * t * t +
                    (1.0 / 24490000.0) * t * t * t
            );
            const mp = rad(
                134.9633964 +
                    477198.8675055 * t +
                    0.0087414 * t * t +
                    (1.0 / 69699.0) * t * t * t -
                    (1.0 / 14712000.0) * t * t * t * t
            );

            const i = rad(
                180 -
                    (d * 180) / Math.PI -
                    6.289 * Math.sin(mp) +
                    2.1 * Math.sin(m) -
                    1.274 * Math.sin(2 * d - mp) -
                    0.658 * Math.sin(2 * d) -
                    0.214 * Math.sin(2 * mp) -
                    0.11 * Math.sin(d)
            );
            return (1 + Math.cos(i)) / 2;
        }

        function percent(time = new Date()) {
            return age(time) / LUNAR_MONTH;
        }

        function age(time = new Date()) {
            let ageFromKnown = time.getTime() / 86400000 - KNOWN_NEW_MOON;
            ageFromKnown += ageFromKnown < 0 ? LUNAR_MONTH : 0;
            return ageFromKnown % LUNAR_MONTH;
        }

        function full(time = new Date()) {
            return illumination(time) > 0.98;
        }

        function calc_sun_and_moon_rs(y, m, day, glong, glat, tz, numday = 1) {
            var OutString = "";
            var calend;
            var quady = new Array();
            var sunp = new Array();
            var moonp = new Array();
            var mj, lst1, i;
            var rads = 0.0174532925,
                sinmoonalt;

            let out = {};

            mj = mjd(day, m, y, 0.0);
            for (i = 0; i < numday; i++) {
                out[caldat(mj + i)] = {
                    sun: find_sun_and_twi_events_for_date(
                        mj + i,
                        tz,
                        glong,
                        glat
                    )
                        .split(" ")
                        .filter((x) => x !== ""),
                    moon: find_moonrise_set(mj + i, tz, glong, glat)
                        .split(" ")
                        .filter((x) => x !== ""),
                };
            }

            return out[caldat(mj)];
        }

        function hrsmin(hours) {
            //
            //	takes decimal hours and returns a string in hhmm format
            //
            var hrs, h, m, dum;
            hrs = Math.floor(hours * 60 + 0.5) / 60.0;
            h = Math.floor(hrs);
            m = Math.floor(60 * (hrs - h) + 0.5);
            dum = h * 100 + m;
            //
            // the jiggery pokery below is to make sure that two minutes past midnight
            // comes out as 0002 not 2. Javascript does not appear to have 'format codes'
            // like C
            //
            if (dum < 1000) dum = "0" + dum;
            if (dum < 100) dum = "0" + dum;
            if (dum < 10) dum = "0" + dum;
            return dum;
        }

        function ipart(x) {
            //
            //	returns the integer part - like int() in basic
            //
            var a;
            if (x > 0) {
                a = Math.floor(x);
            } else {
                a = Math.ceil(x);
            }
            return a;
        }

        function frac(x) {
            //
            //	returns the fractional part of x as used in minimoon and minisun
            //
            var a;
            a = x - Math.floor(x);
            if (a < 0) a += 1;
            return a;
        }

        //
        // round rounds the number num to dp decimal places
        // the second line is some C like jiggery pokery I
        // found in an OReilly book which means if dp is null
        // you get 2 decimal places.
        //
        function round(num, dp) {
            //   dp = (!dp ? 2: dp);
            return Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp);
        }

        function range(x) {
            //
            //	returns an angle in degrees in the range 0 to 360
            //
            var a, b;
            b = x / 360;
            a = 360 * (b - ipart(b));
            if (a < 0) {
                a = a + 360;
            }
            return a;
        }

        function mjd(day, month, year, hour) {
            //
            //	Takes the day, month, year and hours in the day and returns the
            //  modified julian day number defined as mjd = jd - 2400000.5
            //  checked OK for Greg era dates - 26th Dec 02
            //
            var a, b;
            if (month <= 2) {
                month = month + 12;
                year = year - 1;
            }
            a = 10000.0 * year + 100.0 * month + day;
            if (a <= 15821004.1) {
                b = -2 * Math.floor((year + 4716) / 4) - 1179;
            } else {
                b =
                    Math.floor(year / 400) -
                    Math.floor(year / 100) +
                    Math.floor(year / 4);
            }
            a = 365.0 * year - 679004.0;
            return (
                a + b + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0
            );
        }

        function caldat(mjd) {
            //
            //	Takes mjd and returns the civil calendar date in Gregorian calendar
            //  as a string in format yyyymmdd.hhhh
            //  looks OK for Greg era dates  - not good for earlier - 26th Dec 02
            //
            var calout;
            var b, d, f, jd, jd0, c, e, day, month, year, hour;
            jd = mjd + 2400000.5;
            jd0 = Math.floor(jd + 0.5);
            if (jd0 < 2299161.0) {
                c = jd0 + 1524.0;
            } else {
                b = Math.floor((jd0 - 1867216.25) / 36524.25);
                c = jd0 + (b - Math.floor(b / 4)) + 1525.0;
            }
            d = Math.floor((c - 122.1) / 365.25);
            e = 365.0 * d + Math.floor(d / 4);
            f = Math.floor((c - e) / 30.6001);
            day = Math.floor(c - e + 0.5) - Math.floor(30.6001 * f);
            month = f - 1 - 12 * Math.floor(f / 14);
            year = d - 4715 - Math.floor((7 + month) / 10);
            hour = 24.0 * (jd + 0.5 - jd0);
            hour = hrsmin(hour);
            calout = round(
                year * 10000.0 + month * 100.0 + day + hour / 10000,
                4
            );
            return calout + ""; //making sure calout is a string
        }

        function quad(ym, yz, yp) {
            //
            //	finds the parabola throuh the three points (-1,ym), (0,yz), (1, yp)
            //  and returns the coordinates of the max/min (if any) xe, ye
            //  the values of x where the parabola crosses zero (roots of the quadratic)
            //  and the number of roots (0, 1 or 2) within the interval [-1, 1]
            //
            //	well, this routine is producing sensible answers
            //
            //  results passed as array [nz, z1, z2, xe, ye]
            //
            var nz, a, b, c, dis, dx, xe, ye, z1, z2, nz;
            var quadout = new Array();

            nz = 0;
            a = 0.5 * (ym + yp) - yz;
            b = 0.5 * (yp - ym);
            c = yz;
            xe = -b / (2 * a);
            ye = (a * xe + b) * xe + c;
            dis = b * b - 4.0 * a * c;
            if (dis > 0) {
                dx = (0.5 * Math.sqrt(dis)) / Math.abs(a);
                z1 = xe - dx;
                z2 = xe + dx;
                if (Math.abs(z1) <= 1.0) nz += 1;
                if (Math.abs(z2) <= 1.0) nz += 1;
                if (z1 < -1.0) z1 = z2;
            }
            quadout[0] = nz;
            quadout[1] = z1;
            quadout[2] = z2;
            quadout[3] = xe;
            quadout[4] = ye;
            return quadout;
        }

        function lmst(mjd, glong) {
            //
            //	Takes the mjd and the longitude (west negative) and then returns
            //  the local sidereal time in hours. Im using Meeus formula 11.4
            //  instead of messing about with UTo and so on
            //
            var lst, t, d;
            d = mjd - 51544.5;
            t = d / 36525.0;
            lst = range(
                280.46061837 +
                    360.98564736629 * d +
                    0.000387933 * t * t -
                    (t * t * t) / 38710000
            );
            return lst / 15.0 + glong / 15;
        }

        function minisun(t) {
            //
            //	returns the ra and dec of the Sun in an array called suneq[]
            //  in decimal hours, degs referred to the equinox of date and using
            //  obliquity of the ecliptic at J2000.0 (small error for +- 100 yrs)
            //	takes t centuries since J2000.0. Claimed good to 1 arcmin
            //
            var p2 = 6.283185307,
                coseps = 0.91748,
                sineps = 0.39778;
            var L, M, DL, SL, X, Y, Z, RHO, ra, dec;
            var suneq = new Array();

            M = p2 * frac(0.993133 + 99.997361 * t);
            DL = 6893.0 * Math.sin(M) + 72.0 * Math.sin(2 * M);
            L = p2 * frac(0.7859453 + M / p2 + (6191.2 * t + DL) / 1296000);
            SL = Math.sin(L);
            X = Math.cos(L);
            Y = coseps * SL;
            Z = sineps * SL;
            RHO = Math.sqrt(1 - Z * Z);
            dec = (360.0 / p2) * Math.atan(Z / RHO);
            ra = (48.0 / p2) * Math.atan(Y / (X + RHO));
            if (ra < 0) ra += 24;
            suneq[1] = dec;
            suneq[2] = ra;
            return suneq;
        }

        function minimoon(t) {
            //
            // takes t and returns the geocentric ra and dec in an array mooneq
            // claimed good to 5' (angle) in ra and 1' in dec
            // tallies with another approximate method and with ICE for a couple of dates
            //
            var p2 = 6.283185307,
                arc = 206264.8062,
                coseps = 0.91748,
                sineps = 0.39778;
            var L0,
                L,
                LS,
                F,
                D,
                H,
                S,
                N,
                DL,
                CB,
                L_moon,
                B_moon,
                V,
                W,
                X,
                Y,
                Z,
                RHO,
                dec,
                ra;
            var mooneq = new Array();

            L0 = frac(0.606433 + 1336.855225 * t); // mean longitude of moon
            L = p2 * frac(0.374897 + 1325.55241 * t); //mean anomaly of Moon
            LS = p2 * frac(0.993133 + 99.997361 * t); //mean anomaly of Sun
            D = p2 * frac(0.827361 + 1236.853086 * t); //difference in longitude of moon and sun
            F = p2 * frac(0.259086 + 1342.227825 * t); //mean argument of latitude

            // corrections to mean longitude in arcsec
            DL = 22640 * Math.sin(L);
            DL += -4586 * Math.sin(L - 2 * D);
            DL += +2370 * Math.sin(2 * D);
            DL += +769 * Math.sin(2 * L);
            DL += -668 * Math.sin(LS);
            DL += -412 * Math.sin(2 * F);
            DL += -212 * Math.sin(2 * L - 2 * D);
            DL += -206 * Math.sin(L + LS - 2 * D);
            DL += +192 * Math.sin(L + 2 * D);
            DL += -165 * Math.sin(LS - 2 * D);
            DL += -125 * Math.sin(D);
            DL += -110 * Math.sin(L + LS);
            DL += +148 * Math.sin(L - LS);
            DL += -55 * Math.sin(2 * F - 2 * D);

            // simplified form of the latitude terms
            S = F + (DL + 412 * Math.sin(2 * F) + 541 * Math.sin(LS)) / arc;
            H = F - 2 * D;
            N = -526 * Math.sin(H);
            N += +44 * Math.sin(L + H);
            N += -31 * Math.sin(-L + H);
            N += -23 * Math.sin(LS + H);
            N += +11 * Math.sin(-LS + H);
            N += -25 * Math.sin(-2 * L + F);
            N += +21 * Math.sin(-L + F);

            // ecliptic long and lat of Moon in rads
            L_moon = p2 * frac(L0 + DL / 1296000);
            B_moon = (18520.0 * Math.sin(S) + N) / arc;

            // equatorial coord conversion - note fixed obliquity
            CB = Math.cos(B_moon);
            X = CB * Math.cos(L_moon);
            V = CB * Math.sin(L_moon);
            W = Math.sin(B_moon);
            Y = coseps * V - sineps * W;
            Z = sineps * V + coseps * W;
            RHO = Math.sqrt(1.0 - Z * Z);
            dec = (360.0 / p2) * Math.atan(Z / RHO);
            ra = (48.0 / p2) * Math.atan(Y / (X + RHO));
            if (ra < 0) ra += 24;
            mooneq[1] = dec;
            mooneq[2] = ra;
            return mooneq;
        }

        function sin_alt(iobj, mjd0, hour, glong, cglat, sglat) {
            //
            //	this rather mickey mouse function takes a lot of
            //  arguments and then returns the sine of the altitude of
            //  the object labelled by iobj. iobj = 1 is moon, iobj = 2 is sun
            //
            var mjd,
                t,
                ra,
                dec,
                tau,
                salt,
                rads = 0.0174532925;
            var objpos = new Array();
            mjd = mjd0 + hour / 24.0;
            t = (mjd - 51544.5) / 36525.0;
            if (iobj == 1) {
                objpos = minimoon(t);
            } else {
                objpos = minisun(t);
            }
            ra = objpos[2];
            dec = objpos[1];
            // hour angle of object
            tau = 15.0 * (lmst(mjd, glong) - ra);
            // sin(alt) of object using the conversion formulas
            salt =
                sglat * Math.sin(rads * dec) +
                cglat * Math.cos(rads * dec) * Math.cos(rads * tau);
            return salt;
        }

        function find_sun_and_twi_events_for_date(mjd, tz, glong, glat) {
            //
            //	this is my attempt to encapsulate most of the program in a function
            //	then this function can be generalised to find all the Sun events.
            //
            //
            var sglong, sglat, date, ym, yz, above, utrise, utset, j, cglat;
            var yp,
                nz,
                rise,
                sett,
                hour,
                z1,
                z2,
                iobj,
                rads = 0.0174532925;
            var quadout = new Array();
            var sinho = new Array();
            var always_up = " ****";
            var always_down = " ....";
            var outstring = "";
            //
            //	Set up the array with the 4 values of sinho needed for the 4
            //      kinds of sun event
            //
            sinho[0] = Math.sin(rads * -0.833); //sunset upper limb simple refraction
            sinho[1] = Math.sin(rads * -6.0); //civil twi
            sinho[2] = Math.sin(rads * -12.0); //nautical twi
            sinho[3] = Math.sin(rads * -18.0); //astro twi
            sglat = Math.sin(rads * glat);
            cglat = Math.cos(rads * glat);
            date = mjd - tz / 24;
            //
            //	main loop takes each value of sinho in turn and finds the rise/set
            //      events associated with that altitude of the Sun
            //
            for (j = 0; j < 4; j++) {
                rise = false;
                sett = false;
                above = false;
                hour = 1.0;
                ym =
                    sin_alt(2, date, hour - 1.0, glong, cglat, sglat) -
                    sinho[j];
                if (ym > 0.0) above = true;
                //
                // the while loop finds the sin(alt) for sets of three consecutive
                // hours, and then tests for a single zero crossing in the interval
                // or for two zero crossings in an interval or for a grazing event
                // The flags rise and sett are set accordingly
                //
                while (hour < 25 && (sett == false || rise == false)) {
                    yz = sin_alt(2, date, hour, glong, cglat, sglat) - sinho[j];
                    yp =
                        sin_alt(2, date, hour + 1.0, glong, cglat, sglat) -
                        sinho[j];
                    quadout = quad(ym, yz, yp);
                    nz = quadout[0];
                    z1 = quadout[1];
                    z2 = quadout[2];
                    let xe = quadout[3];
                    let ye = quadout[4];

                    // case when one event is found in the interval
                    if (nz == 1) {
                        if (ym < 0.0) {
                            utrise = hour + z1;
                            rise = true;
                        } else {
                            utset = hour + z1;
                            sett = true;
                        }
                    } // end of nz = 1 case

                    // case where two events are found in this interval
                    // (rare but whole reason we are not using simple iteration)
                    if (nz == 2) {
                        if (ye < 0.0) {
                            utrise = hour + z2;
                            utset = hour + z1;
                        } else {
                            utrise = hour + z1;
                            utset = hour + z2;
                        }
                    } // end of nz = 2 case

                    // set up the next search interval
                    ym = yp;
                    hour += 2.0;
                } // end of while loop
                //
                // now search has completed, we compile the string to pass back
                // to the main loop. The string depends on several combinations
                // of the above flag (always above or always below) and the rise
                // and sett flags
                //

                if (rise == true || sett == true) {
                    if (rise == true) outstring += " " + hrsmin(utrise);
                    else outstring += " ----";
                    if (sett == true) outstring += " " + hrsmin(utset);
                    else outstring += " ----";
                } else {
                    if (above == true) outstring += always_up + always_up;
                    else outstring += always_down + always_down;
                }
            } // end of for loop - next condition

            return outstring;
        }

        function find_moonrise_set(mjd, tz, glong, glat) {
            //
            //	Im using a separate function for moonrise/set to allow for different tabulations
            //  of moonrise and sun events ie weekly for sun and daily for moon. The logic of
            //  the function is identical to find_sun_and_twi_events_for_date()
            //
            var sglong, sglat, date, ym, yz, above, utrise, utset, j, cglat;
            var yp,
                nz,
                rise,
                sett,
                hour,
                z1,
                z2,
                iobj,
                rads = 0.0174532925;
            var quadout = new Array();
            var sinho;
            var always_up = " ****";
            var always_down = " ....";
            var outstring = "";

            sinho = Math.sin((rads * 8) / 60); //moonrise taken as centre of moon at +8 arcmin
            sglat = Math.sin(rads * glat);
            cglat = Math.cos(rads * glat);
            date = mjd - tz / 24;
            rise = false;
            sett = false;
            above = false;
            hour = 1.0;
            ym = sin_alt(1, date, hour - 1.0, glong, cglat, sglat) - sinho;
            if (ym > 0.0) above = true;
            while (hour < 25 && (sett == false || rise == false)) {
                yz = sin_alt(1, date, hour, glong, cglat, sglat) - sinho;
                yp = sin_alt(1, date, hour + 1.0, glong, cglat, sglat) - sinho;
                quadout = quad(ym, yz, yp);
                nz = quadout[0];
                z1 = quadout[1];
                z2 = quadout[2];
                let xe = quadout[3];
                let ye = quadout[4];

                // case when one event is found in the interval
                if (nz == 1) {
                    if (ym < 0.0) {
                        utrise = hour + z1;
                        rise = true;
                    } else {
                        utset = hour + z1;
                        sett = true;
                    }
                } // end of nz = 1 case

                // case where two events are found in this interval
                // (rare but whole reason we are not using simple iteration)
                if (nz == 2) {
                    if (ye < 0.0) {
                        utrise = hour + z2;
                        utset = hour + z1;
                    } else {
                        utrise = hour + z1;
                        utset = hour + z2;
                    }
                }

                // set up the next search interval
                ym = yp;
                hour += 2.0;
            } // end of while loop

            if (rise == true || sett == true) {
                if (rise == true) outstring += " " + hrsmin(utrise);
                else outstring += " ----";
                if (sett == true) outstring += " " + hrsmin(utset);
                else outstring += " ----";
            } else {
                if (above == true) outstring += always_up + always_up;
                else outstring += always_down + always_down;
            }

            return outstring;
        }

        function calc_date_stats(year, month, day, long, lat, tz) {
            let curDay = new Date(year, month, day);
            let nextDay = new Date(year, month, day + 1);

            let curDayStats = calc_sun_and_moon_rs(
                curDay.getFullYear(),
                curDay.getMonth() + 1,
                curDay.getDate(),
                long,
                lat,
                tz
            );
            let nextDayStats = calc_sun_and_moon_rs(
                nextDay.getFullYear(),
                nextDay.getMonth() + 1,
                nextDay.getDate(),
                long,
                lat,
                tz
            );

            let data = {
                moonrise: undefined,
                moonset: undefined,
                sunrise: undefined,
                sunset: undefined,
                astro_twilight_begin: undefined,
                astro_twilight_end: undefined,
                moonphase: undefined,
                moonillumination: undefined,
                astro_twilight_length: undefined,
            };

            // calculate the moon rise and set for that current day's night.
            data.moonrise = curDayStats.moon[0];
            data.moonset = curDayStats.moon[1];
            if (data.moonset === "----") {
                data.moonset = nextDayStats.moon[1];
            }

            data.sunset = curDayStats.sun[1];
            data.sunrise = nextDayStats.sun[0];

            data.astro_twilight_begin = curDayStats.sun[7];
            data.astro_twilight_end = nextDayStats.sun[6];

            data.moonphase = percent(curDay);
            data.moonillumination = illumination(curDay);

            // calculate the length of the  astro twilight
            let astro_twilight_length = 0;

            let start_hours = parseInt(
                data.astro_twilight_begin.substring(0, 2)
            );
            let start_minutes = parseInt(
                data.astro_twilight_begin.substring(2, 4)
            );
            let end_hours = parseInt(data.astro_twilight_end.substring(0, 2));
            let end_minutes = parseInt(data.astro_twilight_end.substring(2, 4));

            let remaining_hours = 23 - start_hours;
            let remaining_minutes = 60 - start_minutes;

            let minutes = remaining_minutes + end_minutes;
            if (minutes > 60) {
                remaining_hours += 1;
                minutes -= 60;
            }

            let hours = remaining_hours + end_hours;

            data.astro_twilight_length =
                `${hours}`.padStart(2, "0") + `${minutes}`.padStart(2, "0");

            // calculate the percent of the astro night that is moon free
            let astro_twilight_length_hours = parseInt(
                data.astro_twilight_length.substring(0, 2)
            );
            let astro_twilight_length_minutes = parseInt(
                data.astro_twilight_length.substring(2, 4)
            );

            let moonrise_hours = parseInt(data.moonrise.substring(0, 2));
            let moonrise_minutes = parseInt(data.moonrise.substring(2, 4));

            let moonset_hours = parseInt(data.moonset.substring(0, 2));
            let moonset_minutes = parseInt(data.moonset.substring(2, 4));

            let totalmins = 0;

            let astroLength =
                astro_twilight_length_hours * 60 +
                astro_twilight_length_minutes;

            let astroTwilightBegin = parseInt(data.astro_twilight_begin);

            astroLength =
                24 * 60 -
                parseInt(data.astro_twilight_begin.substring(0, 2)) * 60 -
                parseInt(data.astro_twilight_begin.substring(2, 4)) +
                parseInt(data.astro_twilight_end.substring(0, 2)) * 60 +
                parseInt(data.astro_twilight_end.substring(2, 4));

            data.astro_twilight_length = astroLength;

            return data;
        }

        async function updateCalender(month, year, long, lat, tz) {
            let MONTH = month; // 0 - 11;
            let YEAR = year;

            let date = new Date(YEAR, MONTH, 1);
            let firstDay = date.getDay();
            let month_length = new Date(YEAR, MONTH + 1, 0).getDate();

            // remove leftover calender boxes
            let calenderElm = document.getElementById("calender-bounds");
            while (calenderElm.children.length > 7) {
                calenderElm.removeChild(calenderElm.lastChild);
            }

            let rows_needed = Math.ceil((month_length + firstDay) / 7);
            calenderElm = document.getElementById("calender-bounds");
            updateRows(rows_needed);

            let moonImages = ["🌚", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

            for (let i = 0; i < rows_needed * 7; i++) {
                let elm = document.createElement("div");
                elm.classList.add("calender-box");
                calenderElm.appendChild(elm);
            }

            let cells = document.getElementsByClassName("calender-box");
            cells = Array.from(cells);

            for (let i = firstDay; i < month_length + firstDay; i++) {
                let day = i - firstDay + 1;
                let data = calc_date_stats(YEAR, MONTH, day, long, lat, tz);

                // console.log(YEAR, MONTH, day, long, lat, tz);

                let moonChar = moonImages[parseInt(data.moonphase * 8)];

                let template = document.createElement("div");
                template.classList.add("calender-day");
                template.innerHTML = `
                <div class="calender-day-number">${day}</div>
                <div class="moon-info">
                    <div class="moon-image">${moonChar}</div>
                    <div class="moon-illumination">${parseInt(
                        data.moonillumination * 100
                    )}%</div>
                    
                </div>
                <div class="rs-info">
                    <div class="sunimg">🌣</div>
                    <div class="rs-sunset">▲${format_time(data.sunrise)}</div>
                    <div class="rs-sunrise">▼${format_time(data.sunset)}</div>
                    
                    <div class="moonimg">☾</div>
                    <div class="rs-moonrise">▲${format_time(
                        data.moonrise
                    )}</div>
                    <div class="rs-moonset">▼${format_time(data.moonset)}</div>

                    <div class="astro">★</div>
                    <div class="rs-astro-twilight-begin">▲${format_time(
                        data.astro_twilight_begin
                    )}</div>
                    <div class="rs-astro-twilight-end">▼${format_time(
                        data.astro_twilight_end
                    )}</div>
                </div>
                `;

                template.onclick = () => {
                    selectDate(day, MONTH, YEAR);
                };

                cells[i].appendChild(template);
            }
        }

        this.setUpdateFunction(updateCalender);
        this.setDataFunction(calc_date_stats);
        // selectDate

        // initial load
        let date = new Date();
        let month = date.getMonth();

        let year = date.getFullYear();

        document.querySelector("#month-name").innerHTML =
            this.state.months[month];

        // console.log("here");

        updateCalender(month, year, -96, 32, -5);

        document.getElementById("month-select-id").value = month;
        document.getElementById("year-input-id").value = year;
        document.getElementById("long-input-id").value = -96;
        document.getElementById("lat-input-id").value = 32;
        document.getElementById("tz-input-id").value = -5;

        if (navigator.geolocation) {
            // console.log("here2");
            navigator.geolocation.getCurrentPosition((position) => {
                // console.log("here 3");
                let lat = position.coords.latitude;
                let long = position.coords.longitude;

                getTimeZone(long, lat).then((tz) => {
                    if (!this.state.updated) {
                        updateCalender(month, year, long, lat, tz);

                        document.getElementById("month-select-id").value =
                            month;
                        document.getElementById("year-input-id").value =
                            parseInt(year);
                        document.getElementById("long-input-id").value =
                            parseInt(long);
                        document.getElementById("lat-input-id").value =
                            parseInt(lat);
                        document.getElementById("tz-input-id").value = tz;
                    }
                });
            });
        } else {
            updateCalender(month, year, 0, 0, 0);
        }

        setTimeout(() => {
            selectDate(date.getDate(), month, year);
        }, 50);
    }

    async getTimeZone(long, lat) {
        // console.log(long, lat);
        let reqString = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=2b26459c05914f9b8ef6b03923d0be57`;
        let response = await fetch(reqString);
        let data = await response.json();

        // if daylights savings time check using dates
        let date = new Date();
        let month = date.getMonth();
        let year = date.getFullYear();
        let day = date.getDate();

        let dstStart = new Date(year, 2, 14);
        let dstEnd = new Date(year, 10, 7);

        if (date > dstStart && date < dstEnd) {
            return (
                data.features[0].properties.timezone.offset_DST_seconds /
                60 /
                60
            );
        } else {
            return (
                data.features[0].properties.timezone.offset_standard_seconds /
                60 /
                60
            );
        }

        // data.features[0].properties.timezone.offset_DST_seconds / 60 / 60
    }

    setUpdateFunction(func) {
        this.setState({ updateFunction: func });
    }

    setDataFunction(func) {
        this.setState({ dataFunction: func });
    }

    onNewMonthSelect() {
        this.setUpdated();

        let month = document.getElementById("month-select-id").value;
        let year = document.getElementById("year-input-id").value;
        let long = document.getElementById("long-input-id").value;
        let lat = document.getElementById("lat-input-id").value;
        let tz = document.getElementById("tz-input-id").value;

        this.selectDate(1, parseInt(month), parseInt(year));

        this.state.updateFunction(month, year, long, lat, tz);

        document.querySelector("#month-name").innerHTML =
            this.state.months[month];

        this.setState({ long: long });
        this.setState({ lat: lat });
        this.setState({ tz: tz });
    }

    render() {
        return (
            <div id="App">
                <div id="header">
                    <h1>Moon Phase Chart</h1>
                    <h3>A tool for helping you plan astro imaging nights.</h3>
                </div>
                <div id="content-container">
                    <div className="section-marker">
                        <h2 className="section-title">Calender</h2>
                        <div className="line"></div>
                    </div>
                    <div id="calender-container">
                        <div id="calender-content-container">
                            <div id="details">
                                <div id="details-container">
                                    <div id="month-name"></div>
                                    <div id="month-details">
                                        <div className="detail">
                                            <div className="moon-icon">
                                                🌚 New Moon:{" "}
                                            </div>
                                            <div
                                                className="content"
                                                id="new-moon-date"></div>
                                        </div>
                                        <div className="detail">
                                            <div className="moon-icon">
                                                🌕 Full Moon:{" "}
                                            </div>
                                            <div
                                                className="content"
                                                id="full-moon-date"></div>
                                        </div>
                                    </div>
                                    <div id="day-details" data-visible="false">
                                        <div
                                            id="date-content"
                                            className=".content"></div>
                                        <div id="details">
                                            <div
                                                className="detail small"
                                                id="sunrise">
                                                <div className="sun-icon">
                                                    🌣 Sunrise:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="sunrise-content"></div>
                                            </div>
                                            <div
                                                className="detail small"
                                                id="sunset">
                                                <div className="sun-icon">
                                                    🌣 Sunset:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="sunset"></div>
                                            </div>
                                            <div
                                                className="detail small"
                                                id="moonrise">
                                                <div className="moon-icon">
                                                    ☾ Moonrise:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="moonrise"></div>
                                            </div>

                                            <div
                                                className="detail small"
                                                id="moonset">
                                                <div className="moon-icon">
                                                    ☾ Moonset:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="moonset"></div>
                                            </div>

                                            <div
                                                className="detail big"
                                                id="astro-twilight-begin">
                                                <div className="astro-icon">
                                                    ★ Astro Twilight Begin:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="astro-twilight-begin"></div>
                                            </div>

                                            <div
                                                className="detail big"
                                                id="astro-twilight-end">
                                                <div className="astro-icon">
                                                    ★ Astro Twilight End:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="astro-twilight-end"></div>
                                            </div>

                                            <div
                                                className="detail big"
                                                id="illumination">
                                                <div className="moon-icon">
                                                    🌕 Moon Illumination:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="illumination"></div>
                                            </div>

                                            <div
                                                className="detail big"
                                                id="astro-dark-length">
                                                <div className="astro-icon">
                                                    ★ Astro Dark Length:{" "}
                                                </div>
                                                <div
                                                    className="content"
                                                    id="astro-dark-length"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="options">
                                <div id="options-container">
                                    <div id="form">
                                        {/* dropdown for months */}
                                        <div className="pair">
                                            <select
                                                name="month-select"
                                                id="month-select-id">
                                                <option value="0">
                                                    January
                                                </option>
                                                <option value="1">
                                                    February
                                                </option>
                                                <option value="2">March</option>
                                                <option value="3">April</option>
                                                <option value="4">May</option>
                                                <option value="5">June</option>
                                                <option value="6">July</option>
                                                <option value="7">
                                                    August
                                                </option>
                                                <option value="8">
                                                    September
                                                </option>
                                                <option value="9">
                                                    October
                                                </option>
                                                <option value="10">
                                                    November
                                                </option>
                                                <option value="11">
                                                    December
                                                </option>
                                            </select>
                                            <label htmlFor="month-select">
                                                Month
                                            </label>
                                        </div>
                                        {/* year inuput */}
                                        <div className="pair">
                                            <input
                                                type="number"
                                                name="year-input"
                                                id="year-input-id"
                                                placeholder="Year"
                                            />{" "}
                                            <label htmlFor="year-input">
                                                Year
                                            </label>
                                        </div>
                                        {/* long lat and tz */}
                                        <div className="pair">
                                            <input
                                                type="number"
                                                name="long-input"
                                                id="long-input-id"
                                                placeholder="Longitude"
                                            />{" "}
                                            <label htmlFor="long-input">
                                                Longitude
                                            </label>
                                        </div>
                                        <div className="pair">
                                            <input
                                                type="number"
                                                name="lat-input"
                                                id="lat-input-id"
                                                placeholder="Latitude"
                                            />{" "}
                                            <label htmlFor="lat-input">
                                                Latitude
                                            </label>
                                        </div>
                                        <div className="pair">
                                            <input
                                                type="number"
                                                name="tz-input"
                                                id="tz-input-id"
                                                placeholder="Timezone"
                                            />{" "}
                                            <label htmlFor="tz-input">
                                                Timezone
                                            </label>
                                        </div>
                                        <div className="pair">
                                            <button
                                                onClick={this.onNewMonthSelect}>
                                                Load
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="calender">
                                <div
                                    id="calender-bounds"
                                    style={{
                                        gridTemplateRows: this.state.rows,
                                    }}>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">S</span>
                                        unday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">M</span>
                                        onday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">T</span>
                                        uesday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">W</span>
                                        ednesday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">T</span>
                                        hursday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">F</span>
                                        riday
                                    </div>
                                    <div className="calender-header-item">
                                        <span className="firstLetter">S</span>
                                        aturday
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="section-marker">
                        <h2 className="section-title">Planner</h2>
                        <div className="line"></div>
                    </div>
                    <div id="planner-container">
                        <div id="dates-list"></div>
                        <div id="filter-options">
                            <div id="filter-form">
                                <div className="pair filter">
                                    <input
                                        type="checkbox"
                                        name="activated-days"
                                        id="activated-days-check"
                                        className="activator"
                                    />
                                    <div id="days">
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="monday-in"
                                                id="monday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="monday-check"
                                                className="daylabel">
                                                Mon
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="tuesday-in"
                                                id="tuesday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="tuesday-check"
                                                className="daylabel">
                                                Tue
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="wednesday-in"
                                                id="wednesday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="wednesday-check"
                                                className="daylabel">
                                                Wed
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="thursday-in"
                                                id="thursday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="thursday-check"
                                                className="daylabel">
                                                Thur
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="friday-in"
                                                id="friday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="friday-check"
                                                className="daylabel">
                                                Fri
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="saturday-in"
                                                id="saturday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="saturday-check"
                                                className="daylabel">
                                                Sat
                                            </label>
                                        </div>
                                        <div className="day-pairing">
                                            <input
                                                type="checkbox"
                                                name="sunday-in"
                                                id="sunday-check"
                                                className="day-check"
                                            />
                                            <label
                                                htmlFor="sunday-check"
                                                className="daylabel">
                                                Sun
                                            </label>
                                        </div>
                                    </div>
                                    <div id="others">
                                        <div className="pair filters">
                                            <div
                                                id="moon-percent-input"
                                                className="filter">
                                                <input
                                                    type="number"
                                                    name="moon-percent"
                                                    id="moon-percent-id"
                                                    placeholder="Moon Percent"
                                                />
                                                <label htmlFor="moon-percent">
                                                    Moon Percent
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }
}
