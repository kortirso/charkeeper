# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class SpellUpdateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd2024::Character)
          required(:character_spell).filled(type?: ::Dnd2024::Character::Spell)
          optional(:ready_to_use).filled(:bool)
          optional(:notes).maybe(:string, max_size?: 100)
        end
      end

      private

      def do_persist(input)
        input[:character_spell].data =
          input[:character_spell].data.merge(input.except(:character, :character_spell, :notes).stringify_keys)
        input[:character_spell].update!(input.slice(:notes))

        { result: input[:character_spell].reload }
      end
    end
  end
end
