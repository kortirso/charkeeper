# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Animals
      class UpgradeCommand < BaseCommand
        use_contract do
          Ages = Dry::Types['strict.string'].enum('mature', 'nimble', 'savage')
          Specializations = Dry::Types['strict.string'].enum('ambusher', 'bully', 'daredevil', 'racer', 'tracker', 'wrecker')

          params do
            required(:animal).filled(type?: ::Pathfinder2::Character::AnimalCompanion)
            optional(:age).filled(Ages)
            optional(:specialization).filled(Specializations)
          end
        end

        private

        def do_prepare(input)
          input[:data] =
            if input[:age]
              case input[:age]
              when 'mature' then upgrade_to_mature(input)
              when 'nimble' then upgrade_to_nimble(input)
              when 'savage' then upgrade_to_savage(input)
              end
            elsif input[:specialization]
              upgrade_to_special(input)
            else
              upgrade_to_mature(input)
            end
        end

        def do_persist(input)
          input[:animal].update!(data: input[:animal].data.attributes.merge(input[:data])) if input[:data]

          { result: input[:animal] }
        end

        def upgrade_to_mature(input)
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

        def upgrade_to_nimble(input)
          {
            'age' => 'nimble',
            'abilities' => input[:animal].data.abilities.merge(
              { 'str' => 1, 'dex' => 2, 'con' => 1, 'wis' => 1 }, &merge_with_sum
            ),
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'acrobatics' => 2
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max }
          }.compact
        end

        def upgrade_to_savage(input)
          {
            'age' => 'savage',
            'size' => size_change(input),
            'abilities' => input[:animal].data.abilities.merge(
              { 'str' => 2, 'dex' => 1, 'con' => 1, 'wis' => 1 }, &merge_with_sum
            ),
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'athletics' => 2
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max }
          }.compact
        end

        def upgrade_to_special(input)
          result = {
            'specialization' => input[:specialization],
            'size' => size_change(input),
            'abilities' => input[:animal].data.abilities.merge(
              { 'dex' => 1, 'int' => 2 }, &merge_with_sum
            ),
            'saving_throws' => { 'fortitude' => 3, 'reflex' => 3, 'will' => 3 },
            'perception' => 3,
            'weapon_skills' => { 'unarmed' => 2 }
          }.compact
          upgrade_with_specialization(result, input)
        end

        def upgrade_with_specialization(result, input)
          case input[:specialization]
          when 'ambusher' then upgrade_to_ambusher(result, input)
          when 'bully' then upgrade_to_bully(result, input)
          when 'daredevil' then upgrade_to_daredevil(result, input)
          when 'racer' then upgrade_to_racer(result, input)
          when 'tracker' then upgrade_to_tracker(result, input)
          when 'wrecker' then upgrade_to_wrecker(result, input)
          end
        end

        def upgrade_to_ambusher(result, input)
          result.merge({
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'stealth' => 2
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max },
            'abilities' => result['abilities'].merge(
              { 'dex' => 1 }, &merge_with_sum
            ),
            'armor_skills' => { 'unarmored' => 2 }
          })
        end

        def upgrade_to_bully(result, input)
          result.merge({
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'athletics' => 2, 'intimidation' => 2
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max },
            'abilities' => result['abilities'].merge(
              { 'str' => 1, 'cha' => 3 }, &merge_with_sum
            )
          })
        end

        def upgrade_to_daredevil(result, input)
          result.merge({
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'acrobatics' => 3
            }),
            'abilities' => result['abilities'].merge(
              { 'dex' => 1 }, &merge_with_sum
            )
          })
        end

        def upgrade_to_racer(result)
          result.merge({
            'saving_throws' => { 'fortitude' => 4, 'reflex' => 3, 'will' => 3 },
            'abilities' => result['abilities'].merge(
              { 'con' => 1 }, &merge_with_sum
            )
          })
        end

        def upgrade_to_tracker(result, input)
          result.merge({
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'survival' => 2
            }) { |_, oldval, newval| [oldval.to_i + 1, newval].max },
            'abilities' => result['abilities'].merge(
              { 'wis' => 1 }, &merge_with_sum
            )
          })
        end

        def upgrade_to_wrecker(result, input)
          result.merge({
            'selected_skills' => input[:animal].data.selected_skills.merge({
              'athletics' => 3
            }),
            'abilities' => result['abilities'].merge(
              { 'str' => 1 }, &merge_with_sum
            )
          })
        end

        def size_change(input)
          case input[:animal].data.size
          when 'tiny' then 'small'
          when 'small' then 'medium'
          when 'medium' then 'large'
          else input[:animal].data.size
          end
        end

        def merge_with_sum = proc { |_, oldval, newval| oldval + newval }
      end
    end
  end
end
