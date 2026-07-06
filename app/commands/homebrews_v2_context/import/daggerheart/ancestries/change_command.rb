# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Ancestries
        class ChangeCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            change_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.change',
            cache: 'cache.daggerheart_names'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Daggerheart::Feat
                .where(origin: 'ancestry', origin_value: input[:ancestry].id)
                .group_by(&:id)
                .transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:ancestry].update!(input.slice(:title, :description, :public))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            cache.push_item(key: :ancestries, item: input[:ancestry])

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                change_feat.call(
                  feature.except(:id).merge({ feat: existing_feature, no_refresh: true, skip_contract_validation: true })
                )
              else
                add_feat.call(
                  feature.merge({
                    user: input[:user],
                    origin: 'ancestry',
                    origin_value: input[:ancestry].id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
            end
          end

          def remove_features(input)
            ::Daggerheart::Feat
              .where(origin: 'ancestry', origin_value: input[:ancestry].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
