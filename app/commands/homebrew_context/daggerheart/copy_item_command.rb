# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyItemCommand < BaseCommand
      include Deps[
        add_item: 'commands.homebrew_context.daggerheart.add_item'
      ]

      use_contract do
        params do
          required(:item).filled(type?: ::Daggerheart::Item)
          required(:user).filled(type?: ::User)
        end
      end

      private

      def do_persist(input)
        result = add_item.call(
          input[:item].attributes
            .slice('kind', 'info')
            .symbolize_keys
            .merge({ user: input[:user], name: input[:item].name['en'], description: input[:item].description['en'] })
        )[:result]

        { result: result }
      end
    end
  end
end
