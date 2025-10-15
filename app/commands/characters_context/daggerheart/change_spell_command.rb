# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class ChangeSpellCommand < BaseCommand
      use_contract do
        config.messages.namespace = :daggerheart_character

        params do
          required(:character_spell).filled(type?: ::Daggerheart::Character::Feat)
          optional(:active).filled(:bool)
          optional(:ready_to_use).filled(:bool)
          optional(:notes).maybe(:string)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] =
          input
            .except(:character_spell, :ready_to_use)
            .merge({
              value: (input[:character_spell].value || {}).merge(input.except(:character_spell, :notes, :active).stringify_keys)
            })
      end

      def do_persist(input)
        input[:character_spell].update!(input[:attributes])

        { result: input[:character_spell] }
      end
    end
  end
end
