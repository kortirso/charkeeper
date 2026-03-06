# frozen_string_literal: true

module BotContextV2
  module Commands
    module Parsers
      class MakeCheck
        def call(arguments: []) # rubocop: disable Metrics/AbcSize
          result = {}
          parser = OptionParser.new do |act|
            act.on('--adv [TEXT]', Integer) { |text=0| result[:adv] = text.to_i }
            act.on('--advDice [TEXT]') { |text| result[:adv_dice] = text }
            act.on('--dis [TEXT]', Integer) { |text=0| result[:adv] = text.to_i * -1 }
            act.on('--bonus [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i }
            act.on('--penalty [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i * -1 }
            act.on('--target [TEXT]', Integer) { |text=0| result[:target] = text.to_i }
            act.on('--expertise [TEXT]', Integer) { |text=0| result[:expertise] = text.to_i }
            act.on('--id [TEXT]', String) { |text| result[:id] = text }
          end
          parser.parse! arguments
          result
        end
      end
    end
  end
end
