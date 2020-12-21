require 'json'

class SantaBot
  def initialize(config, from)
    @filename = "db/" + from.gsub(/^(\+)/,'') + ".json"

    begin
      @state = JSON.parse File.open(@filename, "rb") {|io| io.read}, symbolize_names: true
    rescue
      reset
    end

    @cfg = JSON.parse File.open(config, "rb") {|io| io.read}, symbolize_names: true

  end

  def reset
    @state = {stage: 0, log: []}
  end

  def hints
    nxt = @cfg[@state[:stage]][:nextLevel]

    if nxt
      return nxt.split("|")
    end

    return []
  end
  
  def parse(txt)
    cur = @cfg[@state[:stage]]
    nxt = @cfg[@state[:stage] + 1]

    @state[:log].push(txt)

    if txt == "reset"
      reset
      return "OK Reset."
    end

    if (cur[:offense] and txt.downcase.match(cur[:offense]))
      if cur[:offenseMsg]
        reset
        save
        return cur[:offenseMsg]
      else
        return nil;
      end
    end
    
    if (!cur[:nextLevel] or txt.downcase.match(cur[:nextLevel])) and nxt
      @state[:stage] += 1
      save
      return cur[:rightMsg] if cur[:rightMsg]
    else
      if cur[:wrongMsg]
        return cur[:wrongMsg]
      end
    end

    return nil
    
  end

  def run(txt=nil)
    r = []

    if txt
      p = parse txt

      if p
        r.push(p)
      end
    end

    r.push(@cfg[@state[:stage]][:message])

    return r
  end

  def done
    return !@cfg[@state[:stage] + 1]
  end
  
  def playfile
    return @cfg[@state[:stage]][:playfile]
  end
  
  def save
    File.open(@filename, 'wb') { |f| f.write(@state.to_json) }
  end

end

