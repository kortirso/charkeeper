# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class AddSpellCommand < BaseCommand
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:spell).filled(type?: ::Daggerheart::Feat)
        end
      end

      private

      def do_prepare(input)
        active_spells =
          input[:character].feats.joins(:feat).where(ready_to_use: true).where(feats: { origin: 7 }).count
        input[:ready_to_use] = active_spells < 5
      end

      def do_persist(input)
        result = ::Daggerheart::Character::Feat.create!(
          character: input[:character],
          feat: input[:spell],
          used_count: 0,
          limit_refresh: input[:spell].limit_refresh,
          ready_to_use: input[:ready_to_use]
        )

        { result: result }
      end
    end
  end
end
