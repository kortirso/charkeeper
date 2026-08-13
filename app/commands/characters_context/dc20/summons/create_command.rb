# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Summons
      class CreateCommand < BaseCommand
        include Deps[
          add_feat: 'commands.characters_context.dc20.feats.add'
        ]

        use_contract do
          params do
            required(:parent).filled(type?: Character)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(:string)
          end
        end

        private

        def do_prepare(input)
          input[:user] = input[:parent].user
          input[:type] = 'Dc20::Summon'
          input[:data] = { kind: input[:kind] }
        end

        def do_persist(input)
          summon = ::Dc20::Summon.create!(input.except(:kind))

          refresh_feats(summon)

          { result: summon }
        end

        def refresh_feats(summon)
          ::Dc20::Feat.where(origin: 11, slug: [summon.data.kind, 'general'])
            .reject { |feat| feat.info.price }
            .each do |feat|
              add_feat.call({ character: summon, feat: feat })
            end
        end
      end
    end
  end
end
