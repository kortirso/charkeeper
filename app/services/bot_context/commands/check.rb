# frozen_string_literal: true

module BotContext
  module Commands
    class Check
      def call(source:, arguments:, data:) # rubocop: disable Lint/UnusedMethodArgument
        return if data[:user].nil?
        return if data[:character].nil?

        case data[:character].class.name
        when 'Dnd5::Character', 'Dnd2024::Character'
          BotContext::Commands::Checks::Dnd.new.call(character: data[:character], arguments: arguments)
        when 'Daggerheart::Character'
          BotContext::Commands::Checks::Daggerheart.new.call(character: data[:character], arguments: arguments)
        when 'Dc20::Character'
          BotContext::Commands::Checks::Dc20.new.call(character: data[:character], arguments: arguments)
        end
      end
    end
  end
end
