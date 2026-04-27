# frozen_string_literal: true

module BotContextV2
  module Commands
    class Check
      def call(arguments:, character:)
        service(character).call(arguments: arguments)
      end

      private

      def service(character)
        case character.class.name
        when 'Dnd5::Character', 'Dnd2024::Character', 'Pathfinder2::Character', 'Cosmere::Character'
          BotContextV2::Commands::Checks::Dnd.new
        when 'Daggerheart::Character' then BotContextV2::Commands::Checks::Daggerheart.new
        when 'Dc20::Character' then BotContextV2::Commands::Checks::Dc20.new
        when 'Fate::Character' then BotContextV2::Commands::Checks::Fate.new
        when 'Fallout::Character' then BotContextV2::Commands::Checks::Fallout.new
        end
      end
    end
  end
end
