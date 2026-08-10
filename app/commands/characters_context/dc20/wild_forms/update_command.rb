# frozen_string_literal: true

module CharactersContext
  module Dc20
    module WildForms
      class UpdateCommand < BaseCommand
        include Deps[
          add_feat: 'commands.characters_context.dc20.feats.add'
        ]

        use_contract do
          params do
            required(:wild_form).filled(type?: ::Dc20::WildForm)
            optional(:name).filled(:string, max_size?: 50)
            optional(:ancestry_features).hash
            optional(:health).hash do
              required(:current).filled(:integer)
              required(:temp).filled(:integer)
              optional(:max).filled(:integer)
            end
          end
        end

        private

        def do_prepare(input)
          input[:data] = input[:wild_form].data.attributes
          if input[:ancestry_features]
            input[:ancestry_features]['natural_weapon'] = 1
            input[:data]['ancestry_features'] = input[:ancestry_features]
          end
          input[:data].merge!('health' => input[:health]) if input[:health]
        end

        def do_persist(input)
          input[:wild_form].update!(input.slice(:name, :data))

          refresh_feats(input) if input.key?(:ancestry_features)

          { result: input[:wild_form] }
        end

        def refresh_feats(input) # rubocop: disable Metrics/AbcSize
          input[:wild_form].feats.joins(:feat).where.not(feats: { slug: input[:ancestry_features].keys }).destroy_all

          existing_slugs = input[:wild_form].feats.joins(:feat).pluck('feats.slug')
          ::Dc20::Feat.where(origin: [0, 10], slug: (input[:ancestry_features].keys - existing_slugs)).find_each do |feat|
            add_feat.call({ character: input[:wild_form], feat: feat })
          end
        end
      end
    end
  end
end
