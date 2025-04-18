# 概述
本文用以介绍vue3 diff算法中使用最长递增子序列进行优化的部分

# 二、最长递增子序列 （Longest Increasing Subsequence, LIS）
获取序列中最长递增子序列的算法，完整实现如下：
```ts
/**
 * 获取最长递增子序列的索引（贪心 + 二分查找）
 * @param nums - 输入的数值数组
 * @returns 最长递增子序列的索引数组
 */
function getLongestIncreasingSubsequence(nums: number[]): number[] {
    // 1. 初始化变量
    const sequenceLength = nums.length;
    /**
     * 记录前驱索引的数组
     * 记录nums中每一个元素，在最长递增子序列中，前一个元素的索引
     * 用来最终还原最长递增子序列
     */
    const prevIndexList = new Array(sequenceLength).fill(-1);
    /**
     * 最小末尾数组
     * minTailList[i]，是递增子序列长度为i+1时的最小末尾
     * 贪心的思想，末尾最小，后续扩展数组的可能性就最大
     */
    const minTailList = [0];

    // 2. 遍历数组，构建递增序列
    for (let currentIndex = 1; currentIndex < sequenceLength; currentIndex++) {
        const currentValue = nums[currentIndex];
        const lastSeqIndex = minTailList[minTailList.length - 1];

        // 情况1：当前值大于序列末尾值，直接扩展序列，递增子序列长度变长
        if (nums[lastSeqIndex] < currentValue) {
            prevIndexList[currentIndex] = lastSeqIndex; // 记录前驱
            minTailList.push(currentIndex);
        } else {
            // 情况2：通过二分查找找到当前值的插入位置
            // 递增子序列长度不变，尝试优化之前的最小末尾，达到局部最优
            const insertPosition = binarySearchInsertPosition(
                minTailList,
                (index) => nums[index] >= currentValue
            );

            // 更新序列和前驱记录
            if (insertPosition > 0) {
                prevIndexList[currentIndex] = minTailList[insertPosition - 1];
            }
            minTailList[insertPosition] = currentIndex;
        }
    }

    // 3. 回溯重建最长递增子序列
    return backtrackSequence(minTailList, prevIndexList);
}

/**
 * 二分查找插入位置（第一个不小于目标值的位置）
 */
function binarySearchInsertPosition(
    indices: number[],
    compareFn: (index: number) => boolean
): number {
    let left = 0;
    let right = indices.length - 1;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (compareFn(indices[mid])) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

/**
 * 通过前驱索引回溯生成最终序列
 */
function backtrackSequence(
    minTailList: number[],
    prevIndexList: number[]
): number[] {
    let currentLength = minTailList.length;
    let currentIndex = minTailList[currentLength - 1];
    const result = new Array(currentLength);

    // 从后向前填充结果
    while (currentLength-- > 0) {
        result[currentLength] = currentIndex;
        currentIndex = prevIndexList[currentIndex];
    }
    return result;
}

```


# 三、vue2和vue3的diff对比
待补充