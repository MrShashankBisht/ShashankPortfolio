import http from 'k6/http';
import { check, sleep } from 'k6';

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL = __ENV.BASE_URL || 'https://shashankbisht.com';

// ============================================================
// TEST CONFIGURATION
// ============================================================

export const options = {

    // Gradually increase load
    stages: [
        { duration: '30s', target: 10 },    // Warm up
        { duration: '1m',  target: 50 },    // 50 users
        { duration: '1m',  target: 100 },   // 100 users
        { duration: '1m',  target: 250 },   // 250 users
        { duration: '1m',  target: 500 },   // 500 users
        { duration: '1m',  target: 750 },   // 750 users
        { duration: '1m',  target: 1000 },  // 1000 users

        // Cool down
        { duration: '30s', target: 0 },
    ],

    // Performance requirements
    thresholds: {

        // Less than 1% requests should fail
        http_req_failed: [
            'rate<0.01'
        ],

        // 95% requests should finish within 1 second
        http_req_duration: [
            'p(95)<1000'
        ],

        // 99% requests should finish within 2 seconds
        'http_req_duration': [
            'p(95)<1000',
            'p(99)<2000'
        ],

        // At least 99% of checks should pass
        checks: [
            'rate>0.99'
        ],
    },
};


// ============================================================
// TEST
// ============================================================

export default function () {

    const response = http.get(BASE_URL, {
        tags: {
            name: 'Homepage'
        }
    });

    // Check HTTP response
    check(response, {

        'status is 200': (r) =>
            r.status === 200,

        'response is not empty': (r) =>
            r.body && r.body.length > 0,

    });

    // Print response time occasionally
    if (__ITER % 100 === 0) {
        console.log(
            `Response time: ${response.timings.duration.toFixed(2)} ms`
        );
    }

    // Simulate a small pause between user requests
    sleep(1);
}