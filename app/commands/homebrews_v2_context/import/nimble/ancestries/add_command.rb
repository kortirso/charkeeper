# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Ancestries
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.nimble.feats.add',
            cache: 'cache.nimble_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              ancestry = ::Nimble::Homebrews::Ancestry.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({ origin_value: ancestry.id })
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
