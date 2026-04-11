# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Spells
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :pathfinder2_character

          Kinds = Dry::Types['strict.string'].enum('default', 'innate', 'focus', 'additional')

          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:feat).filled(type?: ::Pathfinder2::Feat)
            optional(:kind).filled(Kinds)
            optional(:level).filled(:integer)
            optional(:prepared_by).maybe(:string)
          end
        end

        private

        def do_prepare(input)
          input[:kind] = 'default' unless input.key?(:kind)
        end

        def do_persist(input)
          spontaneous_caster = ::Pathfinder2::Character::SPONTANEOUS_CASTERS.include?(input[:character].data.main_class)

          result = ::Pathfinder2::Character::Feat.create!(
            character: input[:character],
            feat: input[:feat],
            kind: input[:kind],
            ready_to_use: spontaneous_caster,
            value: spontaneous_caster ? { input[:level].to_s => { 'selected_count' => 1 } } : {},
            prepared_by: input[:prepared_by]
          )

          { result: result }
        end
      end
    end
  end
end
