# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Backgrounds
      class CopyCommand < BaseCommand
        include Deps[add_background: 'commands.homebrew_context.dnd.backgrounds.add']

        use_contract do
          params do
            required(:background).filled(type?: ::Dnd2024::Homebrew::Background)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_persist(input)
          result =
            add_background.call({ user: input[:user], name: input[:background].name, data: input[:background].data })[:result]

          { result: result }
        end
      end
    end
  end
end
