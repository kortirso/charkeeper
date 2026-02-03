# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Items
      class CopyCommand < BaseCommand
        include Deps[
          add_item: 'commands.homebrew_context.dnd.add_item'
        ]

        use_contract do
          params do
            required(:item).filled(type?: ::Dnd5::Item)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_persist(input)
          result = add_item.call(
            input[:item].attributes
              .slice('kind', 'info')
              .symbolize_keys
              .merge({
                user: input[:user],
                name: input[:item].name['en'],
                description: input[:item].description['en'],
                data: input[:item].data.attributes,
                public: false
              })
          )[:result]

          { result: result }
        end
      end
    end
  end
end
