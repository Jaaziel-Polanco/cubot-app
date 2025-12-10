import { type NextRequest, NextResponse } from "next/server"
import { requireVendor } from "@/lib/middleware/auth"
import {
  getVendorBankAccounts,
  upsertVendorBankAccount,
  deleteVendorBankAccount,
} from "@/lib/services/banks"

export async function GET() {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const accounts = await getVendorBankAccounts(profile!.id)
    return NextResponse.json({ accounts })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const body = await request.json()

    const account = await upsertVendorBankAccount({
      vendor_id: profile!.id,
      bank_id: body.bank_id,
      account_number: body.account_number,
      account_holder_name: body.account_holder_name,
      account_type: body.account_type,
      is_primary: body.is_primary ?? false,
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const body = await request.json()

    const account = await upsertVendorBankAccount({
      vendor_id: profile!.id,
      bank_id: body.bank_id,
      account_number: body.account_number,
      account_holder_name: body.account_holder_name,
      account_type: body.account_type,
      is_primary: body.is_primary ?? false,
    })

    return NextResponse.json({ account })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { error, profile } = await requireVendor()
  if (error) return error

  try {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get("id")

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    await deleteVendorBankAccount(accountId, profile!.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

