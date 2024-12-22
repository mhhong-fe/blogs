# 变基

场景：dev分支从master分支切出来之后，二者都各自有一些提交，此时要把dev分支合并到master分支上。

![](https://i.imgur.com/VQ4XZmH.png)

## **使用merge**

```bash
# dev分支上使用git merge
git merge master
```

merge之后，出现分叉的提交记录，如果有冲突，手动解决冲突，再执行add和commit

![image _6_.png](https://s2.loli.net/2024/12/10/3toDXzlx4G8n1JB.webp)

然后在master分支，执行merge，此时是一次快进式合并，master分支直接快进到dev-c3

```bash
# master分支上快进式合并
git checkout master
git merge dev
```



## **使用rebase**

```bash
git rebase master

# master分支上快进式合并
git checkout master
git merge dev
```

执行rebase之后，dev分支上的提交，会基于master的最新提交之后，这就被称为**变基**，可以保持线性的提交记录

![image _7_.png](https://s2.loli.net/2024/12/10/wtF8VZWnBl43LGf.webp)


如果存在冲突，手动解决冲突，然后执行

```bash
git add ./
git rebase --continue

# 取消变基
# git rebase --abort
```

然后在master分支，执行merge，此时是一次快进式合并，master分支直接快进到dev-c2

```bash
# master分支上快进式合并
git checkout master
git merge dev
```



# 合并多次提交

场景：对同一个功能commit了多次，想要合并这多次提交

![image _8_.png](https://s2.loli.net/2024/12/10/ZwQFfXNcvTpoGS9.webp)


使用如下命令：

```bash
git rebase -i HEAD~3
```

此时会出现交互式的窗口：

+ `pick`：保留提交
+ `reword`：保留提交但修改提交信息
+ `edit`：保留提交并允许你在提交时进行修改
+ `squash`：将该提交与前一个提交合并，并将它们的提交信息合并
+ `fixup`：类似于 `squash`，但不保留该提交的提交信息
+ `drop`：删除该提交

```bash
pick B Commit message B
pick C Commit message C
pick D Commit message D
pick E Commit message E
```

修改为：

```bash
pick B Commit message B
fixup C Commit message C
fixup D Commit message D
fixup E Commit message E
```

保存之后，多次提交就会被合并，提交记录就只会保留pick的那一次，如果想要修改提交信息，可以使用reword


