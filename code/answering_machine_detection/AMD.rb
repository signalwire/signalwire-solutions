require 'rubygems'
require 'sinatra'
require 'signalwire'

def giveResponse
     puts "Generating LaML bin here"
     # replace messsage with whatever voicemail you want to leave 
     response = Signalwire::Sdk::VoiceResponse.new do |response|
        response.say(message: "I am honored to be with you today at your commencement from one of the finest universities in
            the world. I never graduated from college. Truth be told, this is the closest I've ever gotten to a
            college graduation. Today I want to tell you three stories from my life. That's it. No big deal. Just
            three stories... When I was young, there was an amazing publication called The Whole Earth
            Catalog, which was one of the bibles of my generation. It was created by a fellow named
            Stewart Brand not far from here in Menlo Park, and he brought it to life with his poetic touch.
            This was in the late 1960's, before personal computers and desktop publishing, so it was all
            made with typewriters, scissors, and polaroid cameras. It was sort of like Google in paperback
            form, 35 years before Google came along: it was idealistic, and overflowing with neat tools and 
            great notions.
            Stewart and his team put out several issues of The Whole Earth Catalog, and then when it had
            run its course, they put out a final issue. It was the mid-1970s, and I was your age. On the back
            cover of their final issue was a photograph of an early morning country road, the kind you might
            find yourself hitchhiking on if you were so adventurous. Beneath it were the words: Stay
            Hungry. Stay Foolish. It was their farewell message as they signed off. Stay Hungry. Stay
            Foolish. And I have always wished that for myself. And now, as you graduate to begin anew, I
            wish that for you.
            Stay Hungry. Stay Foolish.")
      end
    response.to_s
end

def checkIfHuman
    case params[:AnsweredBy]
    when 'machine_end_beep'
        giveResponse
    when 'machine_end_other'
        giveResponse
    when 'machine_end_silence'
        giveResponse
    when 'human'
        'use regular code to redirect to normal call flow here'
    end
end
post '/start' do
    content_type 'text/xml'
    puts "*******************params***************************"
    puts params
    puts "*******************params***************************"
    checkIfHuman
end
