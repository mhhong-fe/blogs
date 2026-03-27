---
order: 6
---

# 概述
本文用以介绍vue3 diff算法中使用最长递增子序列进行优化的部分

# 最长递增子序列
（Longest Increasing Subsequence, LIS）
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


# LIS 在 diff 中的作用

Vue3 diff 算法处理乱序节点时，会先建立新节点到旧节点位置的映射表（`newIndexToOldIndexMap`），再对这张映射表求 LIS。

**映射表中的 LIS 意味着**：这些节点在旧序列中的相对顺序，与它们在新序列中的相对顺序完全一致，因此它们不需要移动——只需移动不在 LIS 中的节点即可完成整体重排，DOM 操作次数等于 `节点总数 - LIS 长度`。

## 示例一：末尾节点移到开头

旧序列：`A B C D E`
新序列：`E A B C D`

构建映射表（记录每个新节点在旧序列中的索引，1-based）：

```
新位置:  0  1  2  3  4
节点:    E  A  B  C  D
旧索引:  5  1  2  3  4
```

对 `[5, 1, 2, 3, 4]` 求 LIS，结果为 `[1, 2, 3, 4]`，对应节点 `A B C D`。

- **不需要移动**：A、B、C、D（它们的相对顺序已经正确）
- **需要移动**：E（1 次 DOM 操作，将 E 插入到 A 之前）

若不使用 LIS，朴素做法可能将 A、B、C、D 依次后移——共 **4 次**操作。LIS 优化后仅需 **1 次**。

## 示例二：多节点乱序

旧序列：`A B C D E F`
新序列：`A D B E C F`

前缀 A、后缀 F 可直接复用，只需处理中间部分：

```
旧中间:  B  C  D  E   （旧索引 1 2 3 4）
新中间:  D  B  E  C
```

构建映射表：

```
新位置:  0  1  2  3
节点:    D  B  E  C
旧索引:  3  1  4  2
```

对 `[3, 1, 4, 2]` 求 LIS，结果为 `[1, 4]`，对应节点 `B E`。

- **不需要移动**：B、E（相对顺序已正确）
- **需要移动**：D（插入到 B 之前）、C（插入到 E 之后）→ 共 **2 次** DOM 操作

若不使用 LIS，4 个节点全部重排最多需要 **4 次**操作。LIS 优化后仅需 **2 次**。

# Vue2 与 Vue3 的 diff 对比

## Vue2：双端对比

Vue2 使用**双端对比**策略，维护四个指针：`oldStart`、`oldEnd`、`newStart`、`newEnd`，每轮依次尝试以下四种比较：

1. `oldStart` vs `newStart`
2. `oldEnd` vs `newEnd`
3. `oldStart` vs `newEnd`（旧头 = 新尾，将节点移到末尾）
4. `oldEnd` vs `newStart`（旧尾 = 新头，将节点移到开头）

若四种均未命中，则在旧节点中建立 key-index 映射，逐个查找新节点对应的旧节点并移动。

四种命中其一后指针收缩，直到两端指针交叉为止。

## Vue3：快速路径 + LIS 优化

Vue3 的处理分为三步：

**第一步：前缀 / 后缀复用**

从头尾分别向中间扫描，跳过 key 和类型相同的节点（原地 patch 即可），将需要处理的范围缩小到中间的乱序段。大多数列表变更（追加、删除、局部更新）在这一步就能完成，不进入后续逻辑。

**第二步：建立 newIndexToOldIndexMap**

对中间乱序段，遍历新节点序列，建立「新节点位置 → 旧节点索引」的映射表，同时完成 patch。没有匹配到旧节点的新节点将被挂载，旧节点中没有被匹配到的将被卸载。

**第三步：LIS 最小化移动次数**

对映射表求 LIS。LIS 中的节点相对顺序已正确，无需移动；只需将不在 LIS 中的节点依次插入正确位置。移动次数 = 乱序段长度 − LIS 长度。

## 对比总结

| | Vue2 双端对比 | Vue3 快速路径 + LIS |
|---|---|---|
| 核心思路 | 四指针双端比较，逐步收缩 | 前后缀剪枝，中间段 LIS 最小移动 |
| 乱序处理 | key-index 映射 + 逐个移动 | LIS 跳过已就位节点，只移动必要节点 |
| 移动次数 | 无最优保证 | 理论最小（= 乱序段 − LIS 长度） |
| 编译优化 | 无 | 结合 `patchFlag` + `dynamicChildren`，静态节点不参与 diff |