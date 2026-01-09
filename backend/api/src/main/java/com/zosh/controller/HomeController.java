package com.zosh.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    // when ever we want to retrive data we use getmapping
    // for insterting we postmapping and for putmapping for upadte

    @GetMapping("/")
    public String HomeControllerHandler(){

        return "user";

    }
}
