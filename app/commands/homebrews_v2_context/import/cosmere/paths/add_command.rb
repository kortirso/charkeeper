# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Paths
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.cosmere.feats.add',
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              path = ::Cosmere::Homebrews::Path.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(feature.except(:id).merge({ origin_value: path.id }))
              end
              path
            end

            cache.push_item(key: :paths, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
