# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Ancestries
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.cosmere.feats.add',
            cache: 'cache.cosmere_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              ancestry = ::Cosmere::Homebrews::Ancestry.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(feature.except(:id).merge({ origin_value: ancestry.id }))
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
