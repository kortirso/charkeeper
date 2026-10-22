# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Backgrounds
        class ChangeCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.pathfinder2.feats.add',
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Pathfinder2::Feat
                .where(origin: 'static_background', origin_value: input[:background].id)
                .group_by(&:id)
                .transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:background].update!(input.slice(:title, :description, :public, :info))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            cache.push_item(key: :backgrounds, item: input[:background])

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                # change_feat.call(
                #   feature.except(:id).merge({ feat: existing_feature, no_refresh: true, skip_contract_validation: true })
                # )
              else
                add_feat.call(
                  feature.merge({ origin_value: input[:background].id })
                )
              end
            end
          end

          def remove_features(input)
            ::Pathfinder2::Feat
              .where(origin: 'static_background', origin_value: input[:background].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
