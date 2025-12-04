# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Homebrew
      class AddItemCommand < BaseCommand
        include Deps[
          add_homebrew_item: 'commands.homebrew_context.daggerheart.add_item',
          add_character_item: 'commands.characters_context.item_add'
        ]

        use_contract do
          config.messages.namespace = :homebrew_item

          params do
            required(:user).filled(type?: ::User)
            required(:character).filled(type?: ::Daggerheart::Character)
            required(:name).filled(:string, max_size?: 50)
            optional(:description).maybe(:string, max_size?: 250)
          end
        end

        private

        def do_persist(input)
          item = add_homebrew_item.call(input.except(:character).merge(kind: 'item'))[:result]
          add_character_item.call({ character: input[:character], item: item })

          { result: item }
        end
      end
    end
  end
end
