# frozen_string_literal: true

module BotContext
  module Commands
    module Parsers
      class CreateRace
        def call(arguments: []) # rubocop: disable Metrics/AbcSize
          result = {}
          parser = OptionParser.new do |act|
            act.on('--system TEXT', %w[daggerheart dnd2024]) { |text| result[:system] = text }
            act.on('--name TEXT') { |text| result[:name] = text }
            act.on('--speed [TEXT]', Integer) { |text=30| result[:speed] = text }
            act.on('--resistance [TEXT]') { |text=''| result[:resistance] = text.split(',').map(&:strip) }
            act.on('--size [TEXT]') { |text='medium'| result[:size] = text.split(',').map(&:strip) }
          end
          parser.parse! arguments
          result
        end
      end
    end
  end
end
