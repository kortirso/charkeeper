# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Upgrade
      class PerformCommand < BaseCommand
        include Deps[add_character_item: 'commands.characters_context.items.add']

        use_contract do
          config.messages.namespace = :dnd2024_item_upgrade

          params do
            required(:character).filled(type?: ::Dnd2024::Character)
            required(:character_item).filled(type?: ::Character::Item)
            required(:character_bonus).filled(type?: ::Character::Bonus)
            required(:name).filled(:string, max_size?: 50)
            required(:state).filled(:string)
          end
        end

        private

        def do_prepare(input)
          input[:states] =
            input[:character_item].states.merge({ input[:state] => input[:character_item].states[input[:state]] - 1 })

          input[:attributes] = {
            character: input[:character],
            item: input[:character_item].item,
            state: input[:state],
            name: input[:name],
            modifiers: input[:character_bonus].value
          }
        end

        def do_persist(input)
          result = ActiveRecord::Base.transaction do
            character_item = add_character_item.call(input[:attributes])[:result]
            update_old_item(input)
            deactivate_old_bonus(input)
            character_item.item
          end

          { result: result }
        end

        def update_old_item(input)
          return input[:character_item].destroy if input[:states].values.sum.zero?

          input[:character_item].update(states: input[:states])
        end

        def deactivate_old_bonus(input)
          input[:character_bonus].update(enabled: false)
        end
      end
    end
  end
end
