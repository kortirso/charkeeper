# frozen_string_literal: true

module BotContext
  module Commands
    module Parsers
      class CreateCampaign
        def call(arguments: [])
          result = {}
          parser = OptionParser.new do |act|
            act.on('--system TEXT', %w[daggerheart dnd2024 dnd5 dc20 pathfinder2]) { |text| result[:system] = text }
            act.on('--name TEXT') { |text| result[:name] = text }
          end
          parser.parse! arguments
          result
        end
      end
    end
  end
end
