from flask import request, jsonify
from flask import Flask
import numpy
import math
import numpy as np

app = Flask('verification-server')


@app.route("/")
def base():
    return "OK"


def distance(sx, sy, dx, dy):
    return math.sqrt(
        ((dx-sx)**2)
        + ((dy-sy)**2)
    )


def standardForm(data, qc=30, tqc=100):
    qr = 1 / qc
    sig = data

    ty = sig[:, 0]
    t = sig[:, 1]
    x = sig[:, 2]
    y = sig[:, 3]

    mint = min(*t)
    maxt = max(*t)
    dt = maxt - mint

    t = (t - mint) / dt

    # Straighten
    [m, _] = np.polyfit(x, y, 1)
    points = np.array(list(zip(x, y)))

    delta = np.arctan(m)

    R = np.array([
        [np.cos(delta), -np.sin(delta)],
        [np.sin(delta), np.cos(delta)]
    ])

    pointsTransformed = points @ R
    x, y = pointsTransformed[:, 0], pointsTransformed[:, 1]

    # Normalize
    minx = min(*x)
    maxx = max(*x)
    dx = maxx - minx

    miny = min(*y)
    maxy = max(*y)
    dy = maxy - miny

    nx = (x - minx) / dx
    ny = (y - miny) / dy

    normalizedPoints = np.array(list(zip(nx, ny)))

    qx = np.array([np.round(i/qr)*qr for i in nx])
    qy = np.array([np.round(i/qr)*qr for i in ny])

    quantizedPoints = np.array(list(zip(qx, qy)))

    withExtraDimensions = []
    lastDist = 0
    liftCount = 0

    for i in range(len(quantizedPoints) - 1):
        s = i
        d = i + 1

        if ty[s] in [0, 1] and ty[d] == 1:
            dist = lastDist + \
                math.sqrt(((qx[s] - qx[d]) ** 2) + ((qy[s] - qy[d]) ** 2))

            withExtraDimensions.append([
                t[s],    # From Time
                t[d],    # To Time
                lastDist,  # From Dist
                dist,     # To Dist
                liftCount,  # Lift #
                qx[s],    # SRC X
                qy[s],    # SRC Y
                qx[d],    # DST X
                qy[d]     # DST Y
            ])

            lastDist = dist

    totalDist = lastDist
    totalTime = 1

    distanceXY = []
    distanceV = []
    distancePhi = []

    timeXY = []
    timeV = []
    timePhi = []

    distQuant = totalDist / tqc
    timeQuant = totalTime / tqc

    k = 0
    for i in range(tqc):
        targetDist = i * distQuant
        found = False

        while k < len(withExtraDimensions):
            [ft, tt, fd, td, _, srcx, srcy, dstx, dsty] = withExtraDimensions[k]

            if targetDist > td:
                k = k + 1
                continue

            if td - fd == 0:
                k = k + 1
                continue

            r = (targetDist - fd) / (td - fd)
            xAtTarget = srcx + (dstx - srcx)*r
            yAtTarget = srcy + (dsty - srcy)*r
            found = True

            break

        if not found:
            distanceXY.append([-1, -1])
            distanceV.append(-1)
            distancePhi.append(-1)
        else:
            distanceXY.append([xAtTarget, yAtTarget])
            distanceV.append((td - fd) / (tt - ft))

            if dstx - srcx == 0:
                distancePhi.append(3)
            else:
                distancePhi.append(np.arctan((dsty - srcy) / (dstx - srcx)))

#     distanceXY = np.array(distanceXY)

    k = 0
    for i in range(tqc):
        targetTime = i * timeQuant
        found = False

        while k < len(withExtraDimensions):
            [ft, tt, fd, td, _, srcx, srcy, dstx, dsty] = withExtraDimensions[k]

            if targetTime > tt:
                k = k + 1
                continue

            if tt - ft == 0:
                k = k + 1
                continue

            r = (targetTime - ft) / (tt - ft)
            xAtTarget = srcx + (dstx - srcx)*r
            yAtTarget = srcy + (dsty - srcy)*r
            found = True

            break

        if not found:
            timeXY.append([-1, -1])
            timeV.append(-1)
            timePhi.append(-1)
        else:
            timeXY.append([xAtTarget, yAtTarget])
            timeV.append((td - fd) / (tt - ft))

            if dstx - srcx == 0:
                timePhi.append(3)
            else:
                timePhi.append(np.arctan((dsty - srcy) / (dstx - srcx)))

#     timeXY = np.array(timeXY)

    return [timeXY, distanceXY, distanceV, timeV, timePhi, distancePhi]


def col(arr, c):
    return [row[c] for row in arr]


def mean(stack):
    substack = []

    for n in stack:
        if n != -1:
            substack.append(n)

    return np.mean(substack)


def median(stack):
    substack = []

    for n in stack:
        if n != -1:
            substack.append(n)

    return np.median(substack)


def agregateSignatures(data, qc=30, tqc=100):
    arr = []

    for row in data:
        li = standardForm(row, qc, tqc)
        arr.append(li)

    mets = []

    for i in range(0, 2):
        metric = col(arr, i)

        a_mean = []
        a_median = []

        for j in range(tqc):
            pair = col(metric, j)

            a_mean.append([mean(col(pair, 0)), mean(col(pair, 1))])
            a_median.append([median(col(pair, 0)), median(col(pair, 1))])

        mets.append([a_mean, a_median])

    for i in range(2, 6):
        metric = col(arr, i)

        a_mean = []
        a_median = []

        for j in range(tqc):
            stack = col(metric, j)

            a_mean.append(mean(stack))
            a_median.append(median(stack))

        mets.append([a_mean, a_median])

    return mets


def errorDistances(a, b):
    a = np.array(a)
    b = np.array(b)

    dists = []

    for i in range(len(a)):
        if -1 in [a[i][0], a[i][1], b[i][0], b[i][1]]:
            dists.append(2)
        else:
            dists.append(
                numpy.linalg.norm(a[i]-b[i])
            )

    return dists


def compare(training, test, qc=30, tc=100):
    mean = agregateSignatures(training, qc, tc)[0][0]

    medians = []

    for own in training:
        standard_own = standardForm(own, qc, tc)[0]
        dists = errorDistances(mean, standard_own)

        medians.append(np.median(dists))

    max_median = np.max(medians)
    median = np.median(medians)
    thresh = (max_median + median) / 2

    standard_test = standardForm(test, qc, tc)[0]
    dists = errorDistances(mean, standard_test)

    match = True
    meddist = np.median(dists)

    if meddist > thresh:
        match = False

    return (match, thresh, meddist)


@app.route("/verify", methods=['POST'])
def verify():
    content = request.json

    training = content['training']
    test = content['test']

    return jsonify(
        compare(
            [np.array(t) for t in training],
            np.array(test)
        )
    )


app.run(host="0.0.0.0", port="2021", debug=True)
