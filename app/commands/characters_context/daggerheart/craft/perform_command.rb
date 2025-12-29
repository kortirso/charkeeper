# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Craft
      class PerformCommand < BaseCommand
        use_contract do
          config.messages.namespace = :daggerheart_character

          params do
            required(:character).filled(type?: ::Daggerheart::Character)
            required(:item).filled(type?: ::Daggerheart::Item)
            required(:amount).filled(:integer, gt?: 0)
          end
        end

        private

        def do_prepare(input)
          input[:character_item] =
            ::Character::Item
              .create_with(states: ::Character::Item.default_states)
              .find_or_create_by(input.slice(:character, :item))
        end

        def do_persist(input)
          input[:character_item].update!(
            states: input[:character_item].states.merge({
              'backpack' => input[:character_item].states['backpack'].to_i + input[:amount]
            })
          )

          { result: :ok }
        end
      end
    end
  end
end
