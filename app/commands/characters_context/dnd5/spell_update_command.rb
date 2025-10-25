# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class SpellUpdateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd5::Character)
          required(:character_spell).filled(type?: ::Dnd5::Character::Spell)
          optional(:ready_to_use).filled(:bool)
          optional(:notes).maybe(:string, max_size?: 100)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] =
          input
            .except(:character, :character_spell, :ready_to_use)
            .merge({
              data: input[:character_spell].data.merge(input.except(:character, :character_spell, :notes).stringify_keys)
            })
      end

      def do_persist(input)
        input[:character_spell].update!(input[:attributes])

        { result: input[:character_spell].reload }
      end
    end
  end
end
