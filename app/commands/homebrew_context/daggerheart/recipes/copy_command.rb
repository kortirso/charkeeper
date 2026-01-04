# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    module Recipes
      class CopyCommand < BaseCommand
        include Deps[
          add_command: 'commands.homebrew_context.daggerheart.recipes.add'
        ]

        use_contract do
          params do
            required(:recipe).filled(type?: ::Item::Recipe)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_persist(input)
          result = add_command.call(
            input[:recipe].attributes.slice('tool_id', 'item_id').symbolize_keys.merge({ user: input[:user] })
          )[:result]

          { result: result }
        end
      end
    end
  end
end
