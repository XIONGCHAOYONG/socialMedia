package com.x.controller.admin;

import com.x.pojo.dto.TagDTO;
import com.x.pojo.entity.Tag;
import com.x.service.TagService;
import com.x.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/tag")
@RestController
@CrossOrigin
@Controller("adminTagController")
public class TagController {
    @Autowired
    private TagService tagService;
    @GetMapping("/get")
    public Result<List<Tag>> getAllTags(){
        List<Tag> tags = tagService.getAllTags();
        return Result.success(tags);
    }
    @PostMapping("/add")
    public Result addTag(@RequestBody TagDTO tagDTO){
        tagService.addTag(tagDTO);
        return Result.success();
    }
    @DeleteMapping("/delete/{id}")
            public Result deleteTag(@PathVariable Long id)
    {
        tagService.deleteTag(id);
        return Result.success();
    }
    @GetMapping("update/{id}")
    public Result updateTag(@PathVariable Long id)
    {
        tagService.updateTag(id);
        return Result.success();
    }
}
