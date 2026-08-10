# frozen_string_literal: true

module CharactersContext
  module Dc20
    module WildForms
      class CreateCommand < BaseCommand
        include Deps[
          add_feat: 'commands.characters_context.dc20.feats.add'
        ]

        use_contract do
          params do
            required(:parent).filled(type?: Character)
            required(:name).filled(:string, max_size?: 50)
          end
        end

        private

        def do_prepare(input)
          input[:user] = input[:parent].user
          input[:type] = 'Dc20::WildForm'
          input[:data] = { ancestry_features: { natural_weapon: 1 } }
        end

        def do_persist(input)
          wild_form = ::Dc20::WildForm.create!(input)

          refresh_feats(wild_form)

          { result: wild_form }
        end

        def refresh_feats(wild_form)
          add_feat.call({ character: wild_form, feat: ::Dc20::Feat.find_by(origin: 0, slug: 'natural_weapon') })
        end
      end
    end
  end
end
