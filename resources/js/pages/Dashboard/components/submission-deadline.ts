export type CountdownParts = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export const getTimeDifference = (
    targetDate: Date,
    currentTime: Date,
): CountdownParts => {
    const differenceInMilliseconds = Math.abs(
        targetDate.getTime() - currentTime.getTime(),
    );
    const totalSeconds = Math.floor(differenceInMilliseconds / 1000);

    return {
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
    };
};

export const formatCountdown = ({
    days,
    hours,
    minutes,
    seconds,
}: CountdownParts): string => {
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
};
