# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Ancestries
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            cache: 'cache.daggerheart_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              ancestry = ::Daggerheart::Homebrews::Ancestry.create!(input.slice(:user, :title, :description, :public))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'ancestry',
                    origin_value: ancestry.id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
              ancestry
            end

            cache.push_item(key: :ancestries, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
