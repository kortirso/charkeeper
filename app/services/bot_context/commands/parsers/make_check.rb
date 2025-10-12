# frozen_string_literal: true

module BotContext
  module Commands
    module Parsers
      class MakeCheck
        def call(arguments: [])
          result = {}
          parser = OptionParser.new do |act|
            act.on('--adv [TEXT]', Integer) { |text=0| result[:adv] = text.to_i }
            act.on('--dis [TEXT]', Integer) { |text=0| result[:adv] = text.to_i * -1 }
            act.on('--bonus [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i }
            act.on('--penalty [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i * -1 }
          end
          parser.parse! arguments
          result
        end
      end
    end
  end
end
