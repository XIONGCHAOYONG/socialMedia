package com.x.service;

import com.x.pojo.dto.PostDTO;
import com.x.pojo.dto.SendPostDTO;

import java.util.List;

public interface PostService {
    List<PostDTO> getPosts(Long userId);

    void sendPost(SendPostDTO sendPostDTO);

    void deletePost(Long id);

    List<PostDTO> getAllPosts();

    List<PostDTO> getMomentsListById(Long friendId);
}
