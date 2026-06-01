# frozen_string_literal: true

module SheetsContext
  module Json
    class Generate
      def call(character:)
        case character.class.name
        when 'Daggerheart::Character' then daggerheart_json(character)
        when 'Pathfinder2::Character' then pathfinder2_json(character)
        end
      end

      private

      def daggerheart_json(character)
        SheetsContext::Json::Daggerheart::Generate.new.to_json(character: character)
      end

      def pathfinder2_json(character)
        SheetsContext::Json::Pathfinder2::Generate.new.to_json(character: character)
      end
    end
  end
end
