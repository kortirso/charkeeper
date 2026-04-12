# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Animals
      class UpgradeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :pathfinder2_animal_companion

          params do
            required(:animal).filled(type?: ::Pathfinder2::Character::AnimalCompanion)
          end
        end

        private

        def do_prepare(input)
          input[:data] =
            case input[:animal].data.age
            when 'young' then upgrade_for_young(input)
            end
        end

        def do_persist(input)
          input[:animal].update!(data: input[:animal].data.attributes.merge(input[:data])) if input[:data]

          { result: input[:animal] }
        end

        def upgrade_for_young(input)
          {
            'age' => 'mature',
            'size' => size_change(input),
            'abilities' => input[:animal].data.abilities.merge(
              { 'str' => 1, 'dex' => 1, 'con' => 1, 'wis' => 1 }, &merge_with_sum
            ),
            'saving_throws' => { 'fortitude' => 2, 'reflex' => 2, 'will' => 2 },
            'perception' => 2,
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'survival' => 1, 'intimidation' => 1, 'stealth' => 1
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max }
          }.compact
        end

        def size_change(input)
          case input[:animal].data.size
          when 'small' then 'medium'
          when 'medium' then 'large'
          end
        end

        def merge_with_sum = proc { |_, oldval, newval| oldval + newval }
      end
    end
  end
end
