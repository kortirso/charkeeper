# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeEnergyCommand < BaseCommand
      use_contract do
        Rests = Dry::Types['strict.string'].enum('short', 'long', 'session')

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:value).filled(Rests)
        end
      end

      private

      def do_persist(input)
        input[:character].feats.where(limit_refresh: limit_refresh(input)).update_all(used_count: 0)

        { result: input[:character] }
      end

      def limit_refresh(input)
        case input[:value]
        when 'long' then [0, 1]
        when 'short' then 0
        when 'session' then 2
        end
      end
    end
  end
end
