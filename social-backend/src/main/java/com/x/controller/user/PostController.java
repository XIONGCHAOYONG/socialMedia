package com.x.controller.user;

import com.x.pojo.dto.PostDTO;
import com.x.pojo.dto.SendPostDTO;
import com.x.service.PostService;
import com.x.utils.Result;
import org.apache.ibatis.annotations.Delete;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/post")
@CrossOrigin
public class PostController {
    @Autowired
    private PostService postService;
    @GetMapping("/getPosts/{userId}")
    public Result<List<PostDTO> > getPosts(@PathVariable Long userId){
        List<PostDTO> posts = postService.getPosts(userId);
        return Result.success(posts);
    }
    @PostMapping("/sendPost")
    public Result<String> sendPost(@RequestBody SendPostDTO sendPostDTO){
        postService.sendPost(sendPostDTO);
        return Result.success("发送成功");
    }
    @DeleteMapping("/deletePost/{id}")
    public Result deletePost(@PathVariable Long id){
        postService.deletePost(id);
        return Result.success("删除成功");
    }

    @GetMapping("getMomentsListById/{friendId}")
    public Result<List<PostDTO>> getMomentsListById(@PathVariable Long friendId){
        List<PostDTO> momentsList = postService.getMomentsListById(friendId);
        return Result.success(momentsList);
    }
}
