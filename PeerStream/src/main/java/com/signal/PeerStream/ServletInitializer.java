package com.signal.PeerStream;

import java.util.Properties;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		Properties props = new Properties();
	    props.setProperty("spring.config.location", "/resources/application.properties"); //set the config file to use    
	    application.application().setDefaultProperties(props);
		
		return application.sources(PeerStreamApplication.class);
	}

}
