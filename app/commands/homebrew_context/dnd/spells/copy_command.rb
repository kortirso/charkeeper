# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Spells
      class CopyCommand < BaseCommand
        include Deps[
          add_spell: 'commands.homebrew_context.dnd.spells.add'
        ]

        use_contract do
          params do
            required(:spell).filled(type?: ::Dnd2024::Feat)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_persist(input)
          result = add_spell.call(
            input[:spell].attributes
              .slice('kind', 'info', 'origin_values')
              .symbolize_keys
              .merge({
                user: input[:user],
                title: input[:spell].title['en'],
                description: input[:spell].description['en'],
                public: false
              })
          )

          { result: result[:result] }
        end
      end
    end
  end
end
