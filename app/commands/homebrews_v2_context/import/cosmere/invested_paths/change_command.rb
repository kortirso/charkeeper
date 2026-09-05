# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module InvestedPaths
        class ChangeCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.cosmere.feats.add',
            change_feat: 'commands.homebrews_v2_context.import.cosmere.feats.change',
            cache: 'cache.cosmere_names'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Cosmere::Feat
                .where(origin: 'radiant_path', origin_value: input[:invested_path].id)
                .group_by(&:id)
                .transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:invested_path].update!(input.slice(:title, :description, :public, :info))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            cache.push_item(key: :invested_paths, item: input[:invested_path])

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                change_feat.call(
                  feature.except(:id).merge({ feat: existing_feature, origin_value: input[:invested_path].id })
                )
              else
                add_feat.call(
                  feature.merge({ origin_value: input[:invested_path].id })
                )
              end
            end
          end

          def remove_features(input)
            ::Cosmere::Feat
              .where(origin: 'radiant_path', origin_value: input[:invested_path].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
