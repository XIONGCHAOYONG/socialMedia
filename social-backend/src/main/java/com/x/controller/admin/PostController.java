package com.x.controller.admin;

import com.x.pojo.dto.PostDTO;
import com.x.service.PostService;
import com.x.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/post")
@RestController
@CrossOrigin
@Controller("adminPostController")
public class PostController {
    @Autowired
  private PostService postService;

    @GetMapping("/get")
    public Result<List<PostDTO>> getAllPosts(){
        List<PostDTO> posts = postService.getAllPosts();
        return Result.success(posts);
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> deletePost(@PathVariable Long id){
        postService.deletePost(id);
        return Result.success("删除成功");
    }
}
