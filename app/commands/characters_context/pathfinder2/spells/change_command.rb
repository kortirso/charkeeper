# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Spells
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :pathfinder2_character

          params do
            required(:character_spell).filled(type?: ::Pathfinder2::Character::Feat)
            optional(:ready_to_use).filled(:bool)
            optional(:notes).maybe(:string, max_size?: 100)
            optional(:level).filled(:integer)
            optional(:selected_count).filled(:integer)
            optional(:used_count).filled(:integer)
            optional(:signature).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          if input.key?(:level)
            input[:value] =
              input[:character_spell].value.deep_stringify_keys.deep_merge({
                input[:level].to_s => {
                  'selected_count' => input[:selected_count], 'used_count' => input[:used_count] || 0
                }.compact_blank
              })
          elsif input.key?(:signature)
            input[:value] =
              input[:character_spell].value.deep_stringify_keys.merge({
                'signature' => input[:signature]
              })
          end
        end

        def do_persist(input)
          input[:character_spell].update!(input.slice(:ready_to_use, :value, :notes))

          { result: input[:character_spell] }
        end
      end
    end
  end
end
