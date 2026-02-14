# frozen_string_literal: true

module BotContextV2
  module Commands
    class Check
      def call(arguments:, character:)
        case character.class.name
        when 'Dnd5::Character', 'Dnd2024::Character', 'Pathfinder2::Character'
          BotContextV2::Commands::Checks::Dnd.new.call(arguments: arguments)
        when 'Daggerheart::Character'
          BotContextV2::Commands::Checks::Daggerheart.new.call(arguments: arguments)
        when 'Dc20::Character'
          BotContextV2::Commands::Checks::Dc20.new.call(arguments: arguments)
        when 'Fate::Character'
          BotContextV2::Commands::Checks::Fate.new.call(arguments: arguments)
        end
      end
    end
  end
end
